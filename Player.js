"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const ko = __importStar(require("knockout"));
const Friendly_1 = require("./Friendly");
const Loop_1 = require("./Loop");
const Loops_1 = require("./Loops");
class Player extends Friendly_1.Friendly {
    constructor(params) {
        // params.onDeath = ((originalOnDeath) => {
        //   return function () {
        //     _onDeath();
        //     if (originalOnDeath) {
        //       originalOnDeath(this);
        //     }
        //   };
        // })(params.onDeath);
        super("Player", params);
        this.critChance = ko.pureComputed(() => 0.1);
        this.manaPercentageString = ko.pureComputed(() => `${(100.0 * this.mana()) / this.maxMana()}%`);
        this.manaStatusString = ko.pureComputed(() => `${this.mana()} / ${this.maxMana()}`);
        this.spendMana = (amount) => {
            this._adjustMana(0 - amount);
        };
        this.restoreManaToMax = () => {
            this.mana(this.maxMana());
        };
        this.setTarget = (target) => {
            if (!this.isDead()) {
                this.target(target);
            }
        };
        this.getActionByIndex = (index) => {
            return index >= 0 && this.actions().length > index
                ? this.actions()[index]
                : null;
        };
        this._onDeath = () => {
            this.target(undefined);
            this._loops.stop();
        };
        this._adjustMana = (amount) => {
            var currentMana = this.mana();
            var newMana = currentMana + amount;
            if (newMana >= this.maxMana()) {
                this.mana(this.maxMana());
            }
            else if (newMana <= 0) {
                this.mana(0);
            }
            else {
                this.mana(newMana);
            }
        };
        this._regenMana = () => {
            var increase = this._baseMana * 0.05;
            this._adjustMana(increase);
        };
        this._mana = params.mana || 1000;
        this._baseMana = params.baseMana || this._mana;
        this._maxMana = params.maxMana || this._mana;
        this._actions = params.actions || [];
        this.mana = ko.observable(this._mana);
        this.maxMana = ko.observable(this._maxMana);
        this.actions = ko.observableArray(this._actions);
        this.target = ko.observable();
        this.inGlobalCooldown = ko.observable(false);
        this.isPlayer = true;
        this._loops = new Loops_1.Loops(new Loop_1.Loop("Regen Mana", this._regenMana, 5000));
        this._loops.start();
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map