import { game } from "./game.ts"
import { technology } from "./research.ts"
import { getTotalAssignedLand } from "./assignments.ts"
import { createInventoryElem } from "./items/create.ts"
import { items } from "./items/data.ts"
import { recalculateCatSkills } from "./cats.ts"

let lastCatStarve = Date.now();
const seasons = [
    {
        "name": "Spring",
        "description": "Not too hot nor cold.",
        "class": "spring"
    },
    {
        "name": "Summer",
        "description": "Cats can get hot so make sure to craft some water if you can.",
        "hot": true,
        "class": "summer"
    },
    {
        "name": "Autumn",
        "description": "Make sure to prepare for winter.",
        "class": "autumn"
    },
    {
        "name": "Winter",
        "description": "Prey is hard to find during winter.",
        "cold": true,
        "class": "winter"
    }
]
let season = 0;
const seasonLength = 15 * 60;
let secondsUntilNextSeason = seasonLength;

export const tick = () => {
    if (game.cats.length === 0) {
        document.getElementById("game")!.hidden = true;
        document.getElementById("gameOver")!.hidden = false;
        return;
    }
    let waterLeft = game.inventory.water_cup ?? 0;
    const foodHunted = Math.min(50 * 2 ** game.landSize, Math.floor((seasons[season].cold ? 0.1 : 1) * Math.floor(game.cats.filter(cat => cat.role === "Hunter" && (seasons[season].hot ? --waterLeft > 0 : true)).reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0) * ((game.comfort / 20) + 1))));
    console.log(waterLeft)
    const requiredFood = game.cats.length * 10 * (game.raid ? 1.5 : 1)
    if (foodHunted - requiredFood > 0) {
        if (game.starvationPoints > 0) {
            game.starvationPoints -= foodHunted - requiredFood;
            if (game.starvationPoints < 0) game.starvationPoints = 0;
        } else {
            game.foodStock.push(foodHunted - requiredFood);
        };
    }
    if (foodHunted - requiredFood < 0) {
        if (game.foodStock.length > 0) {
            const difference = requiredFood - foodHunted;
            let takenAway = 0;
            while (takenAway < difference) {
                takenAway += game.foodStock[0];
                game.foodStock.splice(0, 1);
                if (takenAway < difference && game.foodStock.length === 0) {
                    game.starvationPoints += difference - takenAway;
                    takenAway -= difference
                    break
                };
            };
            if (difference - takenAway > 0) game.foodStock.unshift(difference - takenAway);
        } else {
            game.starvationPoints += requiredFood - foodHunted;
        }
    };
    if (game.foodStock.length > 30) {
        game.foodStock.splice(0, 1)
    }
    const maxFoodStock = (game.landAssignedTypes.food_stockpiles ?? 0) * 200 + 200
    document.getElementById("maxFoodStock")!.textContent = maxFoodStock + "";
    if (game.foodStock.reduce((l, c, i) => l + c, 0) > maxFoodStock) {
        const totalSurplus = game.foodStock.reduce((l, c, i) => l + c, 0)
        let takenAway = 0
        while (takenAway < (maxFoodStock - totalSurplus)) {
            takenAway += game.foodStock[0]
            game.foodStock.splice(0, 1)
        }
        game.foodStock.unshift(maxFoodStock - game.foodStock.reduce((l, c, i) => l + c, 0) - takenAway)
    }
    if (game.starvationPoints > 500 && Date.now() - lastCatStarve > 9500) {
        lastCatStarve = Date.now();
        const catIndex = Math.floor(Math.random() * game.cats.length);
        const cat = game.cats[catIndex];
        game.cats.splice(catIndex, 1);
        document.getElementById(cat.id + ".catBox")?.remove();
        game.starvationPoints *= game.cats.length / (game.cats.length + 1);
        game.starvationPoints = Math.ceil(game.starvationPoints);
        if (game.starvationPoints > 500) game.starvationPoints = 500;
    };
    document.getElementById("foodHunted")!.textContent = `${foodHunted}/${requiredFood}`
    const displayFoodStock = game.starvationPoints > 0 ? -game.starvationPoints + "" : game.foodStock.reduce((l, c, i) => l + c, 0) + ""
    document.getElementById("foodStock")!.style.setProperty("--num", displayFoodStock)
    document.getElementById("foodStock")!.setAttribute("aria-label", displayFoodStock)
    const defense = game.cats.filter(cat => cat.role === "Guard").reduce((l, c, i) => l + Math.floor((c.abilities.strength + c.abilities.agility) / 5), 0)
    document.getElementById("defense")!.textContent = defense + "";
    let researchGained = 0;
    for (const cat of game.cats.filter(cat => cat.role === "Researcher")) {
        let currentGain = Math.floor(cat.abilities.intelligence * Math.random() * ((game.comfort / 20) + 1));
        cat.skills ??= {};
        cat.skills.researching ??= {"level": 0, "xp": 0};
        if (Math.random() < 0.1) cat.skills.researching.xp += 1;
        if (cat.skills.researching.xp >= 100 && cat.skills.researching.level < 3) {
            cat.skills.researching.level = 3;
            cat.skills.researching.xp = 0;
        };
        recalculateCatSkills(cat);
        switch (cat.skills.researching.level) {
            case 1:
                currentGain *= 1.1;
                break;
            case 2:
                currentGain *= 1.5;
                break;
            case 3:
                currentGain *= 2;
                break;
        };
        currentGain = Math.floor(currentGain);
        researchGained += currentGain;
    }
    game.researchPoints += researchGained;
    const maxResearchPoints = (game.landAssignedTypes.research_library ?? 0) * 200 + 200
    if (game.researchPoints > maxResearchPoints) game.researchPoints = maxResearchPoints;
    document.getElementById("maxResearchPoints")!.textContent = maxResearchPoints + ""
    document.getElementById("researchPoints")!.style.setProperty("--num", game.researchPoints + "")
    document.getElementById("researchPoints")!.setAttribute("aria-label", game.researchPoints + "")
    document.getElementById("comfort")!.style.setProperty("--num", game.comfort * 5 + "");
    document.getElementById("comfort")!.setAttribute("aria-label", game.comfort * 5 + "");
    if (game.foodStock.reduce((l, c, i) => l + c, 0) > 500 && Math.random() < 0.01 / defense && !game.raid) {
        document.getElementById("raid")!.hidden = false;
        document.getElementById("raidText")!.textContent = "You are being raided. You will use up 1.5x the amount of prey during the raid."
        let timeLeft = 30 - Math.floor(Math.random() * defense)
        document.getElementById("raidTimer")!.textContent = timeLeft + "s left"
        game.raid = true
        const raidInterval = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                document.getElementById("raid")!.hidden = true;
                game.raid = false
                clearInterval(raidInterval)
            }
            document.getElementById("raidTimer")!.textContent = timeLeft + "s left"
        }, 1000)
    }
    for (const technologyItem of technology) {
        const technologyElem = document.getElementById(technologyItem.id + ".research") as HTMLButtonElement
        technologyElem.disabled = technologyItem.cost > game.researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && game.inventory[id] >= amountRequired, true) : false);
    }
    secondsUntilNextSeason -= 1;
    if (secondsUntilNextSeason <= 0) {
        if (season === seasons.length - 1) {
            season = 0;
        } else {
            season += 1;
        }
        secondsUntilNextSeason = seasonLength;
    }
    if (seasons[season].class) document.getElementById("seasonBox")!.className = seasons[season].class!;
    document.getElementById("seasonName")!.textContent = seasons[season].name;
    document.getElementById("seasonDescription")!.innerHTML = seasons[season].description + "<br/<br/>" + secondsUntilNextSeason + " seconds left until " + (season === seasons.length - 1 ? seasons[0].name : seasons[season + 1].name);

    document.getElementById("landSize")!.textContent = game.landSize + ""
    document.getElementById("maxPrey")!.textContent = 50 * 2 ** game.landSize + ""
    document.getElementById("expand")!.textContent = "Expand: " + 100 * 3 ** game.landSize + " research points";
    (document.getElementById("expand") as HTMLButtonElement).disabled = game.researchPoints < 100 * 3 ** game.landSize
    
    document.getElementById("availableLandAssignmentsSpan")!.textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());

    if (game.inventory.water_cup) {
        game.inventory.water_cup = Math.max(0, waterLeft);
        const waterCupSpan = document.getElementById("inventory.water_cup")!
        waterCupSpan.style.setProperty("--num", game.inventory.water_cup + "")
        waterCupSpan.setAttribute("aria-label", game.inventory.water_cup + "")
    }

    let woodGained = 0;
    for (const cat of game.cats.filter(cat => cat.role === "Tree Chopper")) {
        woodGained += Math.floor(Math.random() * 5 * Math.floor(cat.abilities.strength / 5));
        cat.skills ??= {};
        cat.skills.treeChopping ??= {"level": 0, "xp": 0};
        if (Math.random() < 0.1) cat.skills.treeChopping.xp += 1;
        if (cat.skills.treeChopping.xp >= 100 && cat.skills.treeChopping.level < 3) {
            cat.skills.treeChopping.level = 3;
            cat.skills.treeChopping.xp = 0;
        };
        recalculateCatSkills(cat);
        switch (cat.skills.treeChopping.xp) {
            case 1:
                woodGained *= 1.1;
                break;
            case 2:
                woodGained *= 1.5;
                break;
            case 3:
                woodGained *= 2;
                break;
        }
        woodGained = Math.floor(woodGained);
    };
    if (woodGained) {
        game.inventory.wood ??= 0;
        game.inventory.wood += woodGained;
        if (!document.getElementById("inventory.wood")) {
            createInventoryElem("wood")
        }
        const woodSpan = document.getElementById("inventory.wood")!
        woodSpan.style.setProperty("--num", game.inventory.wood + "")
        woodSpan.setAttribute("aria-label", game.inventory.wood + "")
    }
    let stoneGained = 0;
    for (const cat of game.cats.filter(cat => cat.role === "Tree Chopper")) {
        stoneGained += Math.floor(Math.random() * 5 * Math.floor(cat.abilities.strength / 5));
        cat.skills ??= {};
        cat.skills.mining ??= {"level": 0, "xp": 0};
        if (Math.random() < 0.1) cat.skills.mining.xp += 1;
        if (cat.skills.mining.xp >= 100 && cat.skills.mining.level < 3) {
            cat.skills.mining.level = 3;
            cat.skills.mining.xp = 0;
        };
        recalculateCatSkills(cat);
        switch (cat.skills.mining.xp) {
            case 1:
                stoneGained *= 1.1;
                break;
            case 2:
                stoneGained *= 1.5;
                break;
            case 3:
                stoneGained *= 2;
                break;
        }
        stoneGained = Math.floor(stoneGained);
    };
    if (stoneGained) {
        game.inventory.stone ??= 0;
        game.inventory.stone += stoneGained;
        if (!document.getElementById("inventory.stone")) {
            createInventoryElem("stone")
        };
        const stoneSpan = document.getElementById("inventory.stone")!
        stoneSpan.style.setProperty("--num", game.inventory.stone + "");
        stoneSpan.setAttribute("aria-label", game.inventory.stone + "");
    };
    for (const item of items) {
        const itemElem = document.getElementById("inventory." + item.id + ".div");
        if (!itemElem) continue;
        itemElem!.querySelectorAll(".analyzeButton").forEach(analyzeButton => {
            const sellAmount = +(analyzeButton as HTMLButtonElement).dataset.sellAmount!;
            (analyzeButton as HTMLButtonElement).disabled = game.inventory[item.id] < sellAmount;
        });
    };
    const woodPressOperators = game.cats.filter(cat => cat.role === "Wood Press Operator").length;
    if (woodPressOperators) {
        const woodenPlanksGained = Math.min(woodPressOperators, game.inventory.wood_press ?? 0, Math.floor(game.inventory.wood / 500));
        game.inventory.wooden_plank ??= 0;
        game.inventory.wooden_plank += woodenPlanksGained;
        if (!document.getElementById("inventory.wooden_plank")) {
            createInventoryElem("wooden_plank");
        };
        const woodPlankSpan = document.getElementById("inventory.wooden_plank")!
        woodPlankSpan.style.setProperty("--num", game.inventory.wooden_plank + "");
        woodPlankSpan.setAttribute("aria-label", game.inventory.wooden_plank + "");
        game.inventory.wood -= woodenPlanksGained * 500;
    };
    for (const demolishButton of Array.from(document.getElementsByClassName("assignmentItemDemolish")) as HTMLButtonElement[]) {
        const itemId = demolishButton.dataset.id as unknown as number
        demolishButton.disabled = game.inventory[itemId] <= 0
    }
    localStorage.setItem("save", JSON.stringify({
        researched: game.researched,
        cats: game.cats,
        foodStock: game.foodStock,
        researchPoints: game.researchPoints,
        starvationPoints: game.starvationPoints,
        comfort: game.comfort,
        inventory: game.inventory,
        landSize: game.landSize,
        landAssignedTypes: game.landAssignedTypes
    }));
    console.log(localStorage.getItem("save"))
    console.log("cats: " + game.cats.length)
}