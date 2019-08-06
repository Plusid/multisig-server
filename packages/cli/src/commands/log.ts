import { flags } from "@oclif/command";
import clear from "clear";
import Tail from "nodejs-tail";
import readLastLines from "read-last-lines";
import { processManager } from "../process-manager";
import { CommandFlags } from "../types";
import { BaseCommand } from "./command";

export class LogCommand extends BaseCommand {
    public static description: string = "Show the log";

    public static examples: string[] = [`$ multisig-server log`];

    public static flags: CommandFlags = {
        error: flags.boolean({
            description: "only show error output",
        }),
        lines: flags.integer({
            description: "number of lines to tail",
            default: 15,
        }),
    };

    public async run(): Promise<void> {
        const { flags } = this.parse(LogCommand);
        
        const processName: string = this.getProcessName();

        this.abortMissingProcess(processName);

        const { pm2_env } = processManager.describe(processName);

        const file = flags.error ? pm2_env.pm_err_log_path : pm2_env.pm_out_log_path;

        clear();

        this.log(
            `Tailing last ${flags.lines} lines for [${processName}] process (change the value with --lines option)`,
        );

        this.log((await readLastLines.read(file, flags.lines)).trim());

        const log = new Tail(file);

        log.on("line", this.log);

        log.watch();
    }
}
