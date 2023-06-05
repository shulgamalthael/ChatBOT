/* scripts */
import { getRootElement } from "./getRootElement";

export const changeCssVariable = (cssVarName, value) => {
	getRootElement().style.setProperty(cssVarName, value)
}