import * as ko from "knockout";
import GameViewModel from "./GameViewModel";
import applyExtensions from "./KnockoutExtensions";

ko.components.register("game", GameViewModel);

applyExtensions();

ko.applyBindings(null, document.body);
