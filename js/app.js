var w = window;

var ko = require("knockout");
var KnockoutExtensions = require("./KnockoutExtensions");
var GameViewModel = require("./GameViewModel");

KnockoutExtensions.applyExtensions(ko);

ko.utils.registerEventHandler(w, "load",
    function ()
    {
        document.body.appendChild(document.createElement("div")).innerHTML = require("html/GamePage.html");
        ko.applyBindings(new GameViewModel());
    });