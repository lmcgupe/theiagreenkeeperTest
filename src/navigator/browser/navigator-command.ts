/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { CommandHandler, MenuContribution, MenuModelRegistry } from "../../application/common";
import { OpenerService } from '../../application/browser';
import { FileSystem, FileStat } from "../../filesystem/common/filesystem";
import { Commands } from '../../filesystem/browser/filesystem-commands';
import { CONTEXT_MENU_PATH } from "./navigator-widget";
import { FileNavigatorModel } from "./navigator-model";

export const OPEN_MENU_GROUP = '1_open';
export const OPEN_WITH_MENU = 'open-with';
export const CUT_MENU_GROUP = '2_cut/copy/paste';
export const MOVE_MENU_GROUP = '3_move';
export const NEW_MENU_GROUP = '4_new';

@injectable()
export class NavigatorMenuContribution implements MenuContribution {

    constructor(
        @inject(OpenerService) protected readonly openerService: OpenerService
    ) { }

    contribute(registry: MenuModelRegistry) {
        registry.registerMenuAction([CONTEXT_MENU_PATH, OPEN_MENU_GROUP], {
            commandId: Commands.FILE_OPEN
        });
        registry.registerSubmenu([CONTEXT_MENU_PATH, OPEN_MENU_GROUP], OPEN_WITH_MENU, 'Open With');
        this.openerService.getOpeners().then(openers => {
            for (const opener of openers) {
                const openWithCommand = Commands.FILE_OPEN_WITH(opener);
                registry.registerMenuAction([CONTEXT_MENU_PATH, OPEN_MENU_GROUP, OPEN_WITH_MENU], {
                    commandId: openWithCommand.id
                });
            }
        });
        // registry.registerMenuAction([CONTEXT_MENU_PATH, CUT_MENU_GROUP], {
        //     commandId: Commands.FILE_CUT
        // });
        registry.registerMenuAction([CONTEXT_MENU_PATH, CUT_MENU_GROUP], {
            commandId: Commands.FILE_COPY
        });
        registry.registerMenuAction([CONTEXT_MENU_PATH, CUT_MENU_GROUP], {
            commandId: Commands.FILE_PASTE
        });
        registry.registerMenuAction([CONTEXT_MENU_PATH, MOVE_MENU_GROUP], {
            commandId: Commands.FILE_RENAME
        });
        registry.registerMenuAction([CONTEXT_MENU_PATH, MOVE_MENU_GROUP], {
            commandId: Commands.FILE_DELETE
        });
        registry.registerMenuAction([CONTEXT_MENU_PATH, NEW_MENU_GROUP], {
            commandId: Commands.NEW_FILE
        });
        registry.registerMenuAction([CONTEXT_MENU_PATH, NEW_MENU_GROUP], {
            commandId: Commands.NEW_FOLDER
        });
    }
}

export class NavigatorCommandHandler implements CommandHandler {
    constructor(
        protected readonly options: NavigatorCommandHandler.Options,
        protected readonly doExecute: (fileStat: FileStat) => Promise<any>) {
    }

    execute(arg?: any): Promise<any> {
        const node = this.options.model.selectedFileStatNode;
        if (node) {
            return this.doExecute(node.fileStat)
        }
        return Promise.resolve()
    }

    isVisible(arg?: any): boolean {
        if (this.options.model.selectedNode) {
            return true;
        }
        return false;
    }

    isEnabled(arg?: any): boolean {
        return true;
    }

}

export namespace NavigatorCommandHandler {
    export interface Options {
        id: string;
        actionId: string,
        fileSystem: FileSystem,
        model: FileNavigatorModel
    }
}
