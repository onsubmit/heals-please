import * as ko from "knockout";
import applyExtensions from "./KnockoutExtensions";
import GameViewModel from "./GameViewModel";

ko.components.register("game", GameViewModel);

applyExtensions();

ko.applyBindings(null, document.body);
