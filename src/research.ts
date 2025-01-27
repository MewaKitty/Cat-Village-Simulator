import { game } from "./game.ts"
import { createNewRole, getCatElement } from "./cats.ts"
import { showRecruitmentMenu } from "./recruitment.ts";
import { items } from "./items/data.ts"
import { createInventoryElem } from "./items/create.ts"
import { addInventoryItem } from "./items/add.ts"
import { updateInventoryItem } from "./items/update.ts"
import type { Cat } from "./cats.ts"

const craftable: string[] = [];
const craftAmounts = [1, 10, 100]
const sellAmounts = [1, 10, 100];

interface Technology {
    name: string,
    description: string,
    id: string,
    cost: number,
    resource_cost?: Record<string, number>,
    requires?: string[],
    class?: string
}
export const technology: Technology[] = [
    {
        "name": "Basic Recruitment",
        "description": "Recruit more cats to your village!",
        "id": "basic_recruitment",
        "cost": 50
    },
    {
        "name": "Recruitment Propaganda",
        "description": "Recruit cats faster!",
        "id": "recruitment_propaganda",
        "cost": 100,
        "requires": ["basic_recruitment"]
    },
    {
        "name": "Errands",
        "description": "Perform errands for rewards",
        "id": "errands",
        "cost": 200,
        "requires": ["recruitment_propaganda"]
    },
    {
        "name": "Tree Chopper",
        "description": "Make your cats chop down trees for wood!",
        "id": "tree_chopper",
        "cost": 300,
        "requires": ["basic_recruitment"],
        "class": "wood"
    },
    {
        "name": "Basic Den",
        "description": "A basic den for cats to sleep in.",
        "id": "basic_den",
        "cost": 300,
        "resource_cost": {
            "wood": 500
        },
        "requires": ["tree_chopper"],
        "class": "wood"
    },
    {
        "name": "Water Cup",
        "description": "Create cups for cats to drink out of.",
        "id": "water_cup",
        "cost": 300,
        "requires": ["basic_den"],
        "class": "wood"
    },
    {
        "name": "Wooden Plank",
        "description": "A fundamental material.",
        "id": "wooden_plank",
        "cost": 500,
        "resource_cost": {
            "wood": 1000
        },
        "requires": ["basic_den"],
        "class": "wood"
    },
    {
        "name": "Wooden Den",
        "description": "If the basic den too basic for you, make a wooden den.",
        "id": "wooden_den",
        "cost": 750,
        "resource_cost": {
            "wooden_plank": 100
        },
        "requires": ["wooden_plank"],
        "class": "wood"
    },
    {
        "name": "Wooden Recruit-board",
        "description": "If you want more cats, this is for you.",
        "id": "wooden_recruitboard",
        "cost": 1000,
        "resource_cost": {
            "wooden_plank": 500
        },
        "requires": ["recruitment_propaganda", "wooden_plank"],
        "class": "wood"
    },
    {
        "name": "Rock Mining",
        "description": "Go mining to gather stone.",
        "id": "rock_mining",
        "cost": 1500,
        "resource_cost": {
            "wooden_plank": 100
        },
        "requires": ["wooden_plank"],
        "class": "stone"
    },
    {
        "name": "Stone Bricks",
        "description": "Use this for building.",
        "id": "stone_bricks",
        "cost": 2000,
        "resource_cost": {
            "stone": 1000
        },
        "requires": ["rock_mining"],
        "class": "stone"
    },
    {
        "name": "Stone House",
        "description": "More comfort than a wooden den!",
        "id": "stone_house",
        "cost": 3000,
        "resource_cost": {
            "stone_bricks": 1000
        },
        "requires": ["wooden_den", "stone_bricks"],
        "class": "stone"
    },
    {
        "name": "Stone Recruit-board",
        "description": "If you want even more cats, this is for you.",
        "id": "stone_recruitboard",
        "cost": 3000,
        "resource_cost": {
            "stone_bricks": 5000
        },
        "requires": ["wooden_recruitboard", "stone_bricks"],
        "class": "stone"
    },
    {
        "name": "Wood Press",
        "description": "Tired of manually making wooden planks? This machine solves that!",
        "id": "wood_press",
        "cost": 5000,
        "resource_cost": {
            "wooden_plank": 1000,
            "stone_bricks": 5000
        },
        "requires": ["stone_bricks"],
        "class": "wood"
    },
    {
        "name": "Postal Service",
        "description": "Trade with random villages!",
        "id": "postal_service",
        "cost": 3000,
        "resource_cost": {
            "wooden_plank": 100,
            "stone_bricks": 500
        },
        "requires": ["stone_bricks"],
        "class": "stone"
    },
];


const craftingRecipes = [
    {
        "name": "Basic Den",
        "description": "Are your cats not having a good night's sleep? If so, craft the basic den!",
        "id": "basic_den",
        "result": "basic_den",
        "resources": {
            "wood": 200
        }
    },
    {
        "name": "Water Cup",
        "description": "Cats thirsty? Drink water!",
        "id": "water_cup",
        "result": "water_cup",
        "resources": {
            "wood": 1
        }
    },
    {
        "name": "Wooden Plank",
        "description": "Normal wood too weak for you? Make wooden planks!",
        "id": "wooden_plank",
        "result": "wooden_plank",
        "resources": {
            "wood": 500
        }
    },
    {
        "name": "Wooden Den",
        "description": "Want more comfort? Make a wooden den.",
        "id": "wooden_den",
        "result": "wooden_den",
        "resources": {
            "wooden_plank": 20
        }
    },
    {
        "name": "Stone Bricks",
        "description": "Use this for building.",
        "id": "stone_bricks",
        "result": "stone_bricks",
        "resources": {
            "stone": 20
        }
    },
    {
        "name": "Stone House",
        "description": "Want enen more comfort? Make a stone house.",
        "id": "stone_house",
        "result": "stone_house",
        "resources": {
            "stone_bricks": 200
        }
    },
    {
        "name": "Wood Press",
        "description": "Machine that automatically turns wood into wood press. Note: requires cat operator",
        "id": "wood_press",
        "result": "wood_press",
        "resources": {
            "wooden_plank": 100,
            "stone_bricks": 200
        }
    },
]
export const researchCallbacks: Record<string, () => void> = {
    "basic_recruitment": () => {
        showRecruitmentMenu();
    },
    "recruitment_propaganda": () => {
        game.recruitmentCooldown -= 15;
    },
    "errands": () => {
        createNewRole("Errand Runner")
    },
    "tree_chopper": () => {
        createNewRole("Tree Chopper")
    },
    "basic_den": () => {
        craftable.push("basic_den")
        const craftToolButton = document.createElement("button");
        craftToolButton.textContent = "Craft";
        document.getElementById("toolsRow")!.appendChild(craftToolButton);
        craftToolButton.addEventListener("click", () => {
            if (document.getElementById("craftingDiv")) return;
            const craftingDiv = document.createElement("div");
            craftingDiv.id = "craftingDiv";
            craftingDiv.innerHTML = `<b>Crafting</b>
            <p>Hello there! Welcome to the crafting area! What would you like to make today?</p>`;
            document.getElementById("informationList")!.appendChild(craftingDiv);
            const closeButton = document.createElement("div");
            closeButton.classList.add("closeButton")
            closeButton.setAttribute("aria-label", "Close")
            closeButton.textContent = "X"
            closeButton.addEventListener("click", () => {
                craftingDiv.remove();
            })
            craftingDiv.appendChild(closeButton);
            const recipeListDiv = document.createElement("div");
            craftingDiv.appendChild(recipeListDiv)
            for (const recipeId of craftable) {
                const recipe = craftingRecipes.find(recipe => recipe.id === recipeId)!;
                const recipeDiv = document.createElement("div")
                recipeDiv.innerHTML = `<b>${recipe.name}</b>
                <div>${recipe.description}</div>
                <div>${Object.entries(recipe.resources).map(([itemId, quantity]) => items.find(item => item.id === itemId)?.name + ": " + quantity)}`
                for (const craftAmount of craftAmounts) {
                    const craftButton = document.createElement("button");
                    craftButton.textContent = "Craft " + craftAmount + "x"
                    recipeDiv.appendChild(craftButton);
                    recipeListDiv.appendChild(recipeDiv)
                    craftButton.addEventListener("click", () => {
                        const craftable = Object.entries(recipe.resources).reduce((l, [itemId, quantity]) => l && game.inventory[itemId] >= quantity * craftAmount, true);
                        if (!craftable) return craftButton.textContent = "Craft " + craftAmount + "x - unaffordable!"
                        for (const [itemId, quantity] of Object.entries(recipe.resources)) {
                            game.inventory[itemId] -= quantity * craftAmount;
                            const itemSpan = document.getElementById("inventory." + itemId)!;
                            itemSpan.style.setProperty("--num", game.inventory[itemId] + "")
                            itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
                            if (game.inventory[itemId] === 0) itemSpan.remove();
                        }
                        game.inventory[recipe.result] ??= 0;
                        addInventoryItem(recipe.result, craftAmount)
                        
                        if (!document.getElementById("inventory." + recipe.result)) {
                            createInventoryElem(recipe.result)
                        }
                        const resultSpan = document.getElementById("inventory." + recipe.result)!
                        resultSpan.style.setProperty("--num", game.inventory[recipe.result] + "")
                        resultSpan.setAttribute("aria-label", game.inventory[recipe.result] + "")
                    })
                }
            }
        })
    },
    "water_cup": () => {
        craftable.push("water_cup")
    },
    "wooden_plank": () => {
        craftable.push("wooden_plank")
    },
    "wooden_den": () => {
        craftable.push("wooden_den")
    },
    "wooden_recruitboard": () => {
        game.recruitmentCooldown -= 10
    },
    "rock_mining": () => {
        createNewRole("Miner")
    },
    "stone_bricks": () => {
        craftable.push("stone_bricks")
    },
    "stone_house": () => {
        craftable.push("stone_house")
    },
    "stone_recruitboard": () => {
        game.recruitmentCooldown -= 10
    },
    "wood_press": () => {
        createNewRole("Wood Press Operator")
        craftable.push("wood_press")
    },
    "postal_service": () => {
        const relationsButton = document.createElement("button");
        relationsButton.textContent = "Relations";
        document.getElementById("toolsRow")!.appendChild(relationsButton);
        relationsButton.addEventListener("click", () => {
            if (document.getElementById("relationsDiv")) return;
            const relationsDiv = document.createElement("div");
            relationsDiv.id = "relationsDiv";
            const closeButton = document.createElement("div");
            closeButton.classList.add("closeButton")
            closeButton.setAttribute("aria-label", "Close")
            closeButton.textContent = "X"
            closeButton.addEventListener("click", () => {
                relationsDiv.remove();
            })
            document.getElementById("informationList")!.appendChild(relationsDiv);
            const mainRelationsPage = () => {
                relationsDiv.innerHTML = `<b>Relations</b>
            <span>Hello there! Welcome to the relations area! What would you like to do today?</span>`;
                relationsDiv.appendChild(closeButton);
                const storeButton = document.createElement("button");
                storeButton.textContent = "Store";
                relationsDiv.appendChild(storeButton);
                storeButton.addEventListener("click", () => {
                    storeRelationsPage();
                });
            };
            const storeRelationsPage = () => {
                relationsDiv.innerHTML = `<b>Store</b>
                <span${game.catDollars} cat dollars</span>
                <span>Would you like to sell or buy?</span>`;
                relationsDiv.appendChild(closeButton);
                const sellToolButton = document.createElement("button");
                sellToolButton.textContent = "Sell";
                sellToolButton.addEventListener("click", () => {
                    relationsDiv.innerHTML = `<b>Selling</b>
                    <span>What would you like to sell?</span>`;
                    relationsDiv.appendChild(closeButton);
                    const catDollarspan = document.createElement("span");
                    catDollarspan.textContent = game.catDollars + " cat dollars";
                    relationsDiv.appendChild(catDollarspan);
                    const backButton = document.createElement("button");
                    backButton.textContent = "Back";
                    relationsDiv.appendChild(backButton);
                    backButton.addEventListener("click", storeRelationsPage);
                    for (const [itemId, quantity] of Object.entries(game.inventory)) {
                        const itemSpan = document.createElement("span");
                        itemSpan.classList.add("itemSpan");
                        const itemData = items.find(item => item.id === itemId);
                        if (!itemData) continue;
                        if (!itemData.sell) continue;
                        const nameAndQuantitySpan = document.createElement("span");
                        nameAndQuantitySpan.textContent = `${quantity}x ${itemData.name}`;
                        itemSpan.appendChild(nameAndQuantitySpan);
                        for (const sellAmount of sellAmounts) {
                            const sellButton = document.createElement("button");
                            sellButton.textContent = "Sell " + sellAmount + "x";
                            sellButton.addEventListener("click", () => {
                                if (sellAmount > quantity) return sellButton.textContent = "Sell " + sellAmount + "x - unaffordable!";
                                game.inventory[itemId] -= sellAmount;
                                game.catDollars += itemData.sell! * sellAmount;
                                
                                updateInventoryItem(itemId);
                                catDollarspan.textContent = game.catDollars + " cat dollars";
                                
                                nameAndQuantitySpan.textContent = `${game.inventory[itemId]}x ${itemData.name}`;
                            });
                            itemSpan.appendChild(sellButton);
                        };
                        relationsDiv.appendChild(itemSpan);
                    };
                });
                relationsDiv.appendChild(sellToolButton);
                const buyToolButton = document.createElement("button");
                buyToolButton.textContent = "Buy";
                buyToolButton.addEventListener("click", () => {
                    relationsDiv.innerHTML = `<b>Buying</b>
                    <span>What would you like to buy?</span>`;
                    relationsDiv.appendChild(closeButton)
                    const catDollarspan = document.createElement("span")
                    catDollarspan.textContent = game.catDollars + " cat dollars"
                    relationsDiv.appendChild(catDollarspan)
                    const backButton = document.createElement("button")
                    backButton.textContent = "Back";
                    relationsDiv.appendChild(backButton);
                    backButton.addEventListener("click", storeRelationsPage);
                    for (const item of items) {
                        const itemSpan = document.createElement("span");
                        if (!item.buy) return;
                        itemSpan.textContent = item.name + ": " + item.buy + " cat dollars each";
                        itemSpan.classList.add("itemSpan");
                        for (const amount of sellAmounts) {
                            const buyButton = document.createElement("button");
                            buyButton.textContent = "Buy " + amount + "x";
                            buyButton.addEventListener("click", () => {
                                if (item.buy! * amount > game.catDollars) return buyButton.textContent = "Buy " + amount + "x - unaffordable!";
                                addInventoryItem(item.id, amount)
                                game.catDollars -= item.buy! * amount;
                                
                                updateInventoryItem(item.id);

                                catDollarspan.textContent = game.catDollars + " cat dollars";
                            });
                            itemSpan.appendChild(buyButton);
                        };
                        relationsDiv.appendChild(itemSpan);
                    };
                });
                relationsDiv.appendChild(buyToolButton);
            };
            mainRelationsPage();
        })
    }
};

export const setupTechnologyItem = (technologyItem: Technology) => {
    const technologyElem = document.createElement("li");
    technologyElem.id = technologyItem.id + ".item";
    technologyElem.innerHTML = `<b>${technologyItem.name}</b>
    <p>${technologyItem.description}</p>
    <span>Cost: ${technologyItem.cost} research points${technologyItem.resource_cost ? "<br/>" + Object.entries(technologyItem.resource_cost).map(([id, quantity]) => 
        items.find(item => item.id === id)?.name + ": " + quantity
    ).join("<br/>") : ""}</span>`;
    if (technologyItem.requires) technologyElem.hidden = true;
    if (technologyItem.class) technologyElem.classList.add(technologyItem.class);
    const researchButton = document.createElement("button");
    researchButton.textContent = "Research";
    researchButton.disabled = true;
    researchButton.id = technologyItem.id + ".research";
    researchButton.addEventListener("click", () => {
        if (technologyItem.cost > game.researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && game.inventory[id] >= amountRequired, true) : false)) return;
        game.researchPoints -= technologyItem.cost;
        if (technologyItem.resource_cost) {
            for (const [itemId, quantity] of Object.entries(technologyItem.resource_cost)) {
                game.inventory[itemId] -= quantity;
                const itemSpan = document.getElementById("inventory." + itemId)!;
                itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
                itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
                if (game.inventory[itemId] === 0) itemSpan.remove();
            }
        }
        game.researched[technologyItem.id] = true;
        technologyElem.hidden = true;
        researchCallbacks[technologyItem.id]();
        for (const technologyNextItem of technology) {
            if (!technologyNextItem.requires || !technologyNextItem.requires.includes(technologyItem.id)) continue;
            const canResearch = technologyNextItem.requires.reduce((l, c) => l && game.researched[c], true)
            if (canResearch) document.getElementById(technologyNextItem.id + ".item")!.hidden = false;
        };
    })
    technologyElem.appendChild(researchButton);
    document.getElementById("technologyList")?.appendChild(technologyElem)
}