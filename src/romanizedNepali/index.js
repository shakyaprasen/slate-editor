
import { translate } from './core';

export function convert(raw,smartConvert=true)
{
    let charactersUnicode= translate(raw,smartConvert).split("#");
    let convertedCharacters="";
    charactersUnicode.forEach(element => {
      if(element)
        convertedCharacters+=String.fromCharCode(element.replace("¬",""));
    });
    return convertedCharacters;
}
