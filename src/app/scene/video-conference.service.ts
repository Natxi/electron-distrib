import {Injectable} from '@angular/core';
import {IVCFKey, VCFCommands, VCFkeyboard} from "../../../electron/utils";

@Injectable({
  providedIn: 'root'
})
export class VideoConferenceService {

  constructor() { }

  getVideoConferenceCommandsFromDest(destiny: string): VCFCommands [] {
    const aKey = VCFkeyboard.find(c => c.name === 'a');
    const oneKey = VCFkeyboard.find(c => c.name === '1');
    const specialKey = VCFkeyboard.find(c => c.name === 'abc');
    let currentKey = aKey;
    let commands = [VCFCommands.BACK, VCFCommands.MENU, VCFCommands.HOME, VCFCommands.RIGHT, VCFCommands.LEFT, VCFCommands.BACKSPACE, VCFCommands.OK];
    const destinyChars = Array.from(destiny);

    destinyChars.forEach((char: string) => {
      switch (char) {
        case '.':
          commands.push(VCFCommands.SPOT);
          break;
        case '0':
          commands.push(VCFCommands.ZERO);
          break;
        case '1':
          commands.push(VCFCommands.ONE);
          break;
        case '2':
          commands.push(VCFCommands.TWO);
          break;
        case '3':
          commands.push(VCFCommands.THREE);
          break;
        case '4':
          commands.push(VCFCommands.FOUR);
          break;
        case '5':
          commands.push(VCFCommands.FIVE);
          break;
        case '6':
          commands.push(VCFCommands.SIX);
          break;
        case '7':
          commands.push(VCFCommands.SEVEN);
          break;
        case '8':
          commands.push(VCFCommands.EIGHT);
          break;
        case '9':
          commands.push(VCFCommands.NINE);
          break;
        case '#':
          commands.push(VCFCommands.POUND);
          break;
        default:
          if (char) {
            const vcfKey = VCFkeyboard.find(c => c.name === char);
            if (vcfKey && currentKey && aKey && oneKey) {
              if (currentKey.position.x !== vcfKey.position.x || currentKey.position.y !== vcfKey.position.y || currentKey.position.special !== vcfKey.position.special) {
                if (vcfKey.position.special !== currentKey.position.special) {
                  if (specialKey) {
                    commands = [...commands, ...this.getCommandsFromKeyToKey(currentKey, specialKey)];
                    commands.push(VCFCommands.OK);
                    currentKey = vcfKey.position.special ? oneKey : aKey;
                  }
                }
                commands = [...commands, ...this.getCommandsFromKeyToKey(currentKey, vcfKey)];
              }
              currentKey = vcfKey;
            }
            commands.push(VCFCommands.OK);
          }
          break;
      }
    });
    commands.push(VCFCommands.CALL);
    return destiny.length > 0 ? commands : [];
  }

  getCommandsFromKeyToKey(fromKey: IVCFKey, toKey: IVCFKey): VCFCommands [] {
    const difX = Math.abs(toKey.position.x - fromKey.position.x);
    const difY = Math.abs(toKey.position.y - fromKey.position.y);
    const commands = [];
    if (toKey.position.x > fromKey.position.x) {
      for (let i = 0; i < difX; i++) {
        commands.push(VCFCommands.RIGHT);
      }
    } else if (toKey.position.x < fromKey.position.x) {
      for (let i = 0; i < difX; i++) {
        commands.push(VCFCommands.LEFT);
      }
    }
    if (toKey.position.y > fromKey.position.y) {
      for (let i = 0; i < difY; i++) {
        commands.push(VCFCommands.DOWN);
      }
    } else if (toKey.position.y < fromKey.position.y) {
      for (let i = 0; i < difY; i++) {
        commands.push(VCFCommands.UP);
      }
    }
    return commands;
  }
}
