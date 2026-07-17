import { OpenedTab, TemplateFolder, TemplateItem } from '../types';

export interface TerminalContext {
  openTabs: OpenedTab[];
  templateData: TemplateFolder | null;
  activeTabId: string | null;
  clearTerminal: () => void;
  writeLine: (text: string) => void;
}

export const executeSimulatedCommand = (input: string, ctx: TerminalContext) => {
  const trimmed = input.trim();
  if (!trimmed) {
    ctx.writeLine('\r\n');
    return;
  }

  const parts = trimmed.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help':
      ctx.writeLine('\r\n\x1b[1;33mWeb Sandbox Shell Commands:\x1b[0m\r\n');
      ctx.writeLine('  help               Display this operational support routing index');
      ctx.writeLine('  clear              Flush terminal viewport log history');
      ctx.writeLine(
        '  ls                 List structural asset nodes in current working directory'
      );
      ctx.writeLine(
        '  node [filename]    Execute a target JavaScript/TypeScript file inside the sandbox'
      );
      ctx.writeLine('  npm run dev        Trigger compiling active project context buffers\r\n');
      break;

    case 'clear':
      ctx.clearTerminal();
      break;

    case 'ls': {
      if (!ctx.templateData || !ctx.templateData.items || ctx.templateData.items.length === 0) {
        ctx.writeLine('\r\n(empty directory)\r\n');
        break;
      }
      const names = ctx.templateData.items
        .map((item: TemplateItem) => {
          if ('folderName' in item) return `\x1b[1;34m${item.folderName}/\x1b[0m`; // Blue directory lookups
          return `${item.filename}.${item.fileExtension}`;
        })
        .join('   ');
      ctx.writeLine(`\r\n${names}\r\n`);
      break;
    }

    case 'node': {
      const targetFile = args[0];
      if (!targetFile) {
        ctx.writeLine(
          '\r\n\x1b[31mError: Specify target file node context (e.g., node test.js)\x1b[0m\r\n'
        );
        break;
      }

      const foundTab = ctx.openTabs.find(
        t => `${t.filename}.${t.fileExtension}`.toLowerCase() === targetFile.toLowerCase()
      );

      if (foundTab) {
        if (foundTab.fileExtension === 'js' || foundTab.fileExtension === 'ts') {
          ctx.writeLine(
            `\r\n\x1b[32m[running]\x1b[0m node ${targetFile} inside secure window subframe...`
          );

          // Trigger global DOM frame message pipeline evaluation
          window.postMessage({ type: 'TRIGGER_SANDBOX_RUN', tabId: foundTab.id }, '*');
        } else {
          ctx.writeLine(
            `\r\n\x1b[31mError: Node runtime execution is restricted to .js or .ts files.\x1b[0m\r\n`
          );
        }
      } else {
        ctx.writeLine(
          `\r\n\x1b[31mError: File "${targetFile}" is not currently open in editor tabs.\x1b[0m\r\n`
        );
      }
      break;
    }

    case 'npm':
      if (args.join(' ') === 'run dev') {
        ctx.writeLine(
          '\r\n\x1b[35m[vfs-bundler]\x1b[0m Compiling local asset source directories...'
        );
        ctx.writeLine('\x1b[32m✔\x1b[0m Build optimized seamlessly.');
        ctx.writeLine(
          '\x1b[32m✔\x1b[0m Running server environment at \x1b[4;36mhttp://localhost:3000\x1b[0m'
        );
        ctx.writeLine('Press \x1b[33mCtrl + C\x1b[0m to drop server tracking proxy routes.\r\n');

        // Automatically sync and fire active view template to preview layout frame
        if (ctx.activeTabId) {
          window.postMessage({ type: 'TRIGGER_SANDBOX_RUN', tabId: ctx.activeTabId }, '*');
        }
      } else {
        ctx.writeLine(
          `\r\n\x1b[31mnpm script error: script "${args.join(' ')}" not defined in package configuration registry.\x1b[0m\r\n`
        );
      }
      break;

    default:
      ctx.writeLine(`\r\n\x1b[31mbash: command not found: ${command}\x1b[0m\r\n`);
  }
};
