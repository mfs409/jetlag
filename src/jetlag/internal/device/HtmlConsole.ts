import { JetLagConfig } from "../../support/JetLagConfig";
import { JetLagConsole } from "../support/Interfaces"

/** HtmlConsole provides debug messages for HTML devices */
export class HtmlConsole implements JetLagConsole {
    /**
     * Track the level of messages that is allowed
     * - 0: display nothing
     * - 1: display urgent messages
     * - 2: display urgent and informative messages
     */
    private level = 2;

    /**
     * Create an output console based on the game config object
     * 
     * @param cfg The game-wide configuration object
     */
    constructor(cfg: JetLagConfig) { this.level = cfg.verbosity; }

    /**
     * Display an urgent message to the console
     * 
     * @param msg The message to display
     */
    urgent(msg: string) {
        if (this.level > 0) {
            console.log(msg);
        }
    }

    /**
     * Display an informational message to the console
     * 
     * @param msg The message to display
     */
    info(msg: string) {
        if (this.level == 2) {
            console.log(msg);
        }
    }
}