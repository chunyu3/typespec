import vscode from "vscode";
import { TspLanguageClient } from "./tsp-language-client";
import { SettingName } from "./types";
import { InitTemplatesUrlSetting } from "./vscode-cmd/create-tsp-project";

export let tspLanguageClient: TspLanguageClient | undefined;

export function setTspLanguageClient(newTspLanguageClient: TspLanguageClient | undefined) {
  tspLanguageClient = newTspLanguageClient;
}

export const registedTemplates: InitTemplatesUrlSetting[] =
  vscode.workspace
    .getConfiguration()
    .get<InitTemplatesUrlSetting[]>(SettingName.InitTemplatesUrls) ?? [];
