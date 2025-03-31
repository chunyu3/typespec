/* eslint-disable no-console */
import { LogItem, LogListener } from "./logger.js";

export class ConsoleLogLogger implements LogListener {
  Log(log: LogItem) {
    const logToConsole = (log: LogItem, fn: (m?: any, ...p: any[]) => void) => {
      // log.details
      //   ? fn(`[${log.level.toUpperCase()}] ${log.message}`, log.details)
      //   : fn(`[${log.level.toUpperCase()}] ${log.message}`);
      log.details ? fn(`${log.message}`, log.details) : fn(`${log.message}`);
    };
    switch (log.level) {
      case "info":
        logToConsole(log, console.log);
        break;
      case "warn":
        logToConsole(log, console.warn);
        break;
      case "error":
        logToConsole(log, console.error);
        break;
      case "debug":
        logToConsole(log, console.debug);
        break;
      case "trace":
        // only trace log when there is env var 'ENABLE_TRACE_LOG' set to 'true' to avoid too many logs
        if (process.env.ENABLE_TRACE_LOG === "true") {
          logToConsole(log, console.trace);
        }
        break;
    }
  }
}

export class ConsoleLogLogger2 implements LogListener {
  constructor(private logFunc?: (m?: any, ...p: any[]) => void) {}
  Log(log: LogItem) {
    const logToConsole = (log: LogItem, fn: (m?: any, ...p: any[]) => void) => {
      // log.details
      //   ? fn(`[${log.level.toUpperCase()}] ${log.message}`, log.details)
      //   : fn(`[${log.level.toUpperCase()}] ${log.message}`);
      log.details ? fn(`${log.message}`, log.details) : fn(`${log.message}`);
    };

    logToConsole(log, this.logFunc ?? console.log);
    // switch (log.level) {
    //   case "info":
    //     logToConsole(log, console.log);
    //     break;
    //   case "warn":
    //     logToConsole(log, console.warn);
    //     break;
    //   case "error":
    //     logToConsole(log, console.error);
    //     break;
    //   case "debug":
    //     logToConsole(log, console.debug);
    //     break;
    //   case "trace":
    //     // only trace log when there is env var 'ENABLE_TRACE_LOG' set to 'true' to avoid too many logs
    //     if (process.env.ENABLE_TRACE_LOG === "true") {
    //       logToConsole(log, console.trace);
    //     }
    //     break;
    // }
  }
}
