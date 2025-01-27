import { game } from "./game.ts";
import { getCatElement } from "./cats.ts";
import type { Cat } from "./cats.ts";
import { items } from "./items/data.ts"
import { createInventoryElem } from "./items/create.ts"
import { addInventoryItem } from "./items/add.ts"

const errands = [
    {
        "name": "Get a library card?",
        "id": "getALibraryCard",
        "description": "Over several generations, everyone dreamed of one thing. It's... getting a library card? Why are cats allowed to get multiple? How do they even get cards even if there's no library?",
        "reward": {
            "research": 50
        },
        "levelRequirement": 0,
        "complexity": 60,
        "ability": "intelligence"
    },
    {
        "name": "Solve a random mystery",
        "id": "solveARandomMystery",
        "description": "There are always mysteries to be solved for some reason. No one knows why. That in itself is a mystery. Will your cats go find a mystery and solve it?",
        "reward": {
            "research": 100
        },
        "levelRequirement": 0,
        "complexity": 100,
        "ability": "intelligence"
    },
    {
        "name": "Fetch a stick",
        "id": "fetchAStick",
        "description": "There are sticks near the plains area. It's pretty hilly. No one wants to fetch it as it's too tiring. Will you?",
        "reward": {
            "items": {
                "wood": 100
            }
        },
        "levelRequirement": 0,
        "complexity": 60,
        "ability": "strength",
        "requires": "tree_chopper"
    },
]
const activeErrands: string[] = []
let runningErrand = false;
const recalculateErrandLevels = (runners: Cat[]) => {
    let partyXp = 0;
    for (const runner of runners) {
        const catElement = getCatElement(runner.id)
        if (!catElement) continue;
        catElement.classList.remove("runningErrand");
        (document.getElementById(runner.id + ".roleSelect") as HTMLButtonElement).disabled = false;
        partyXp += runner.xp ?? 0
    };
    const partyLevel = Math.floor(Math.sqrt(partyXp / 1000));
    for (const errand of errands) {
        const performButton = document.getElementById("errand." + errand.id + ".perform") as HTMLButtonElement | null;
        if (!performButton) continue;
        if (!runningErrand) performButton.disabled = partyLevel < errand.levelRequirement;
    };
    if (document.getElementById("errandLevel")) document.getElementById("errandLevel")!.textContent = partyLevel + "";
    if (document.getElementById("errandLevelProgress")) {
        document.getElementById("errandLevelProgress")!.setAttribute("min", (partyLevel ** 2) * 1000 + "")
        document.getElementById("errandLevelProgress")!.setAttribute("max", ((partyLevel + 1) ** 2) * 1000 + "")
        document.getElementById("errandLevelProgress")!.setAttribute("value", partyXp + "")
    };
}

const showErrandsMenu = () => {
    const errandsToolButton = document.createElement("button");
    errandsToolButton.textContent = "Errands";
    document.getElementById("toolsRow")!.appendChild(errandsToolButton);
    errandsToolButton.addEventListener("click", () => {
        if (document.getElementById("errandsDiv")) return;
        const errandsDiv = document.createElement("div");
        errandsDiv.id = "errandsDiv";
        errandsDiv.innerHTML = `<b>Errands</b>
        <p>What errands would you like to perform?</p>
        <p>Level <span id="errandLevel"></span>
        <meter id="errandLevelProgress"></meter></p>`;
        document.getElementById("informationList")!.appendChild(errandsDiv);
        const closeButton = document.createElement("div");
        closeButton.classList.add("closeButton");
        closeButton.setAttribute("aria-label", "Close");
        closeButton.textContent = "X";
        closeButton.addEventListener("click", () => {
            errandsDiv.remove();
        });
        errandsDiv.appendChild(closeButton);
        const runners = game.cats.filter(cat => cat.role === "Errand Runner")
        if (runners.length < 3) {
            const errandRunningNotice = document.createElement("p")
            errandRunningNotice.textContent = "You need to select 3 runners to run errands."
            errandsDiv.appendChild(errandRunningNotice)
            return;
        }
        const errandListElem = document.createElement("ul")
        for (const errand of errands) {
            const errandItem = document.createElement("li")
            const errandHeader = document.createElement("b");
            errandHeader.textContent = errand.name + ": " + errand.complexity + " complexity: " + errand.ability;
            errandItem.appendChild(errandHeader)
            const errandDescription = document.createElement("p")
            errandDescription.textContent = errand.description;
            errandItem.appendChild(errandDescription);
            const rewardsList = document.createElement("ul");
            if (errand.reward.research) {
                const researchReward = document.createElement("li");
                researchReward.textContent = errand.reward.research + " research"
                rewardsList.appendChild(researchReward)
            } else if (errand.reward.items) {
                for (const [id, quantity] of Object.entries(errand.reward.items)) {
                    const itemReward = document.createElement("li")
                    itemReward.textContent = quantity + "x " + items.find(item => item.id === id)?.name;
                    rewardsList.appendChild(itemReward);
                };
            };
            errandItem.appendChild(rewardsList);
            const performButton = document.createElement("button");
            performButton.textContent = "Perform Errand";
            performButton.id = "errand." + errand.id + ".perform";
            if (activeErrands.includes(errand.id)) performButton.disabled = true;
            errandListElem.appendChild(errandItem);
            performButton.addEventListener("click", () => {
                performButton.disabled = true;
                activeErrands.push(errand.id);
                runningErrand = true;
                let complexityLeft = errand.complexity;
                for (const runner of runners) {
                    const catElement = getCatElement(runner.id);
                    if (!catElement) continue;
                    catElement.classList.add("runningErrand");
                    (document.getElementById(runner.id + ".roleSelect") as HTMLButtonElement).disabled = true;
                };
                for (const errand of errands) {
                    const currentPerform = document.getElementById("errand." + errand.id + ".perform") as HTMLButtonElement;
                    currentPerform.disabled = true;
                };
                const errandMeter = document.createElement("meter")
                errandMeter.setAttribute("max", errand.complexity + "")
                errandItem.appendChild(errandMeter)
                const errandInterval = setInterval(() => {
                    console.log(complexityLeft)
                    for (const runner of runners) {
                        complexityLeft -= Math.round(Math.random() * runner.abilities[errand.ability])
                    };
                    errandMeter.setAttribute("value", errand.complexity - complexityLeft + "")
                    const checkedPerformButton = document.getElementById("errand." + errand.id + ".perform")
                    if (!checkedPerformButton) return
                    if (complexityLeft <= 0) {
                        clearInterval(errandInterval);
                        if (errand.reward.research) game.researchPoints += errand.reward.research
                        if (errand.reward.items) {
                            for (const [id, quantity] of Object.entries(errand.reward.items)) {
                                createInventoryElem(id);
                                addInventoryItem(id, quantity);
                            };
                        };
                        for (const runner of runners) {
                            const catElement = getCatElement(runner.id)
                            if (!catElement) continue;
                            catElement.classList.remove("runningErrand");
                            (document.getElementById(runner.id + ".roleSelect") as HTMLButtonElement).disabled = false;
                            runner.xp ??= 0;
                            runner.xp += Math.floor(Math.random() * errand.complexity);
                        };
                        (checkedPerformButton as HTMLButtonElement).disabled = false;
                        errandMeter.remove();
                        runningErrand = false;
                        recalculateErrandLevels(runners);
                        return;
                    }
                }, 1000);
            });
            errandItem.appendChild(performButton);
        }
        errandsDiv.appendChild(errandListElem);
        recalculateErrandLevels(runners)
    })
}