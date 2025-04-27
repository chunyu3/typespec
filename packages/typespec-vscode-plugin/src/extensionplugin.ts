import vscode, { commands, ExtensionContext } from "vscode";
import { CommandName } from "./type.js";

export async function activatePlugin(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(CommandName.HelloWorld, (url: string) => {
      try {
        vscode.window.showInformationMessage(`Hello World! ${url}`);
      } catch (error) {
        // logger.error(`Failed to open URL: ${url}`, [error as any]);
      }
    }),
  );
}
