const catNames = (await (await fetch("./cat_names.txt")).text()).split("\n");
const randomCatName = () => catNames[Math.floor(Math.random() * catNames.length)]
const abilities = [
    {
        "id": "strength",
        "name": "Strength"
    },
    {
        "id": "intelligence",
        "name": "Intelligence"
    },
    {
        "id": "agility",
        "name": "Agility"
    },
    {
        "id": "dexterity",
        "name": "Dexterity"
    },
]
interface Cat {
    id: string,
    name: string,
    abilities: Record<string, number>,
    role: string
}
interface PartialCat {
    id: string,
    name: string,
    abilities: Record<string, number>
}
const randomCat = () => {
    const cat: PartialCat = {
        "id": Math.random() + "",
        "name": randomCatName(),
        "abilities": {}
    }
    for (const ability of abilities) {
        cat.abilities[ability.id] = Math.floor(Math.random() * 10) + 5
    }
    return cat
}

const roles = ["Hunter", "Guard", "Researcher"];

interface Technology {
    name: string,
    description: string,
    id: string,
    cost: number,
    resource_cost?: Record<string, number>,
    requires?: string[],
    class?: string
}
const technology: Technology[] = [
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
        "cost": 1000,
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
        "cost": 1500,
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
        "cost": 15000,
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
        "cost": 20000,
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
        "cost": 100000,
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
        "cost": 1000000,
        "resource_cost": {
            "stone_bricks": 1000
        },
        "requires": ["stone_bricks"],
        "class": "stone"
    },
    {
        "name": "Stone Recruit-board",
        "description": "If you want even more cats, this is for you.",
        "id": "stone_recruitboard",
        "cost": 2000000,
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
        "cost": 2000000,
        "resource_cost": {
            "wooden_plank": 1000,
            "stone_bricks": 5000
        },
        "requires": ["stone_bricks"],
        "class": "wood"
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
const craftable: string[] = [];
let recruitmentCooldown = 60;
const craftAmounts = [1, 10, 100]
const researchCallbacks: Record<string, () => void> = {
    "basic_recruitment": () => {
        document.getElementById("toolsNotUnlocked")!.hidden = true;
        const recruitToolButton = document.createElement("button");
        recruitToolButton.textContent = "Recruit";
        document.getElementById("toolsRow")!.appendChild(recruitToolButton);
        recruitToolButton.addEventListener("click", () => {
            if (document.getElementById("recruitmentDiv")) return;
            const recruitmentDiv = document.createElement("div");
            recruitmentDiv.id = "recruitmentDiv";
            recruitmentDiv.innerHTML = `<b>Recruitment</b>
            <p>You go and put up a poster for recruitment. One of the candidates stand out. Would you like to recruit them?</p>`;
            document.getElementById("informationList")!.appendChild(recruitmentDiv);
            const closeRecruit = () => {
                recruitmentDiv.remove();
                recruitToolButton.disabled = true;
                let secsPassed = 0;
                const recruitInterval = setInterval(() => {
                    secsPassed += 1;
                    recruitToolButton.textContent = "Recruit - " + (recruitmentCooldown - secsPassed) + "s left";
                    if (secsPassed >= recruitmentCooldown) {
                        recruitToolButton.textContent = "Recruit";
                        recruitToolButton.disabled = false;
                        clearInterval(recruitInterval);
                    };
                }, 1000);
            }
            const closeButton = document.createElement("div");
            closeButton.classList.add("closeButton")
            closeButton.setAttribute("aria-label", "Close")
            closeButton.textContent = "X"
            closeButton.addEventListener("click", () => {
                closeRecruit()
            })
            recruitmentDiv.appendChild(closeButton);
            const catElement = document.createElement("div");
            catElement.classList.add("catBox");
            const cat = randomCat();
            catElement.innerHTML = `<b>${cat.name}</b>
            ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
                return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
            }).join("")}`;
            const recruitButton = document.createElement("button");
            recruitButton.textContent = "Recruit";
            catElement.appendChild(recruitButton);
            recruitButton.addEventListener("click", () => {
                (cat as Cat).role = "Hunter";
                createCatElement(cat as Cat);
                cats.push(cat as Cat);
                closeRecruit();
            });
            recruitmentDiv.appendChild(catElement);
        });
    },
    "recruitment_propaganda": () => {
        recruitmentCooldown -= 15;
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
                        const craftable = Object.entries(recipe.resources).reduce((l, [itemId, quantity]) => l && inventory[itemId] >= quantity * craftAmount, true);
                        if (!craftable) return craftButton.textContent = "Craft " + craftAmount + "x - unaffordable!"
                        for (const [itemId, quantity] of Object.entries(recipe.resources)) {
                            inventory[itemId] -= quantity * craftAmount;
                            const itemSpan = document.getElementById("inventory." + itemId)!;
                            itemSpan.style.setProperty("--num", inventory[itemId] + "")
                            itemSpan.setAttribute("aria-label", inventory[itemId] + "");
                            if (inventory[itemId] === 0) itemSpan.remove();
                        }
                        inventory[recipe.result] ??= 0;
                        inventory[recipe.result] += craftAmount;
                        
                        if (!document.getElementById("inventory." + recipe.result)) {
                            createInventoryElem(recipe.result)
                        }
                        const woodSpan = document.getElementById("inventory." + recipe.result)!
                        woodSpan.style.setProperty("--num", inventory[recipe.result] + "")
                        woodSpan.setAttribute("aria-label", inventory[recipe.result] + "")
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
        recruitmentCooldown -= 20
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
        recruitmentCooldown -= 10
    },
    "wood_press": () => {
        createNewRole("Wood Press Operator")
        craftable.push("wood_press")
    },
};
const items = [
    {
        "id": "wood",
        "name": "Wood",
        "sell": 1
    },
    {
        "id": "water_cup",
        "name": "Water Cup",
        "sell": 1
    },
    {
        "id": "basic_den",
        "name": "Basic Den",
        "sell": 10,
        "usable": true
    },
    {
        "id": "wooden_plank",
        "name": "Wooden Plank",
        "sell": 50
    },
    {
        "id": "wooden_den",
        "name": "Wooden Den",
        "sell": 200,
        "usable": true
    },
    {
        "id": "stone",
        "name": "Stone",
        "sell": 5
    },
    {
        "id": "stone_bricks",
        "name": "Stone Bricks",
        "sell": 250
    },
    {
        "id": "stone_house",
        "name": "Stone House",
        "sell": 400,
        "usable": true
    },
    {
        "id": "wood_press",
        "name": "Wood Press",
        "sell": 1000
    },
];
const itemUse: Record<string, () => void> = {
    "basic_den": () => {
        comfort += 1;
    },
    "wooden_den": () => {
        comfort += 5;
    },
    "stone_house": () => {
        comfort += 10;
    },
};
const createNewRole = (roleName: string) => {
    roles.push(roleName)
    for (const cat of cats) {
        const catElement = document.getElementById(cat.id + ".catBox")!;
        const roleOption = document.createElement("option")
        roleOption.textContent = roleName;
        catElement.querySelector("select")?.appendChild(roleOption);
    }
}
let researched: Record<string, boolean> = {};
let cats: Cat[] = [];
const createCatElement = (cat: Cat) => {
    const catElement = document.createElement("div");
    catElement.id = cat.id + ".catBox";
    catElement.classList.add("catBox");
    catElement.innerHTML = `<b>${cat.name}</b>
    ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
        return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
    }).join("")}`;
    document.getElementById("catList")?.appendChild(catElement);
    const roleSelect = document.createElement("select");
    roleSelect.id = cat.id + ".roleSelect";
    for (const role of roles) {
        const roleOption = document.createElement("option");
        roleOption.textContent = role;
        roleSelect.appendChild(roleOption);
    };
    catElement.appendChild(roleSelect);
    roleSelect.addEventListener("change", () => {
        cat.role = roleSelect.options[roleSelect.selectedIndex].text;
    });
};

const setupTechnologyItem = (technologyItem: Technology) => {

    const technologyElem = document.createElement("div");
    technologyElem.id = technologyItem.id + ".div";
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
        if (technologyItem.cost > researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && inventory[id] >= amountRequired, true) : false)) return;
        researchPoints -= technologyItem.cost;
        if (technologyItem.resource_cost) {
            for (const [itemId, quantity] of Object.entries(technologyItem.resource_cost)) {
                inventory[itemId] -= quantity;
                const itemSpan = document.getElementById("inventory." + itemId)!;
                itemSpan.style.setProperty("--num", inventory[itemId] + "");
                itemSpan.setAttribute("aria-label", inventory[itemId] + "");
                if (inventory[itemId] === 0) itemSpan.remove();
            }
        }
        researched[technologyItem.id] = true;
        technologyElem.hidden = true;
        researchCallbacks[technologyItem.id]();
        for (const technologyNextItem of technology) {
            if (!technologyNextItem.requires || !technologyNextItem.requires.includes(technologyItem.id)) continue;
            const canResearch = technologyNextItem.requires.reduce((l, c) => l && researched[c], true)
            if (canResearch) document.getElementById(technologyNextItem.id + ".div")!.hidden = false;
        };
    })
    technologyElem.appendChild(researchButton);
    document.getElementById("technologyList")?.appendChild(technologyElem)
}
document.getElementById("start")?.addEventListener("click", () => {
    console.log("click")
    document.getElementById("titleScreen")!.hidden = true;
    document.getElementById("welcomeScreen")!.innerHTML = `<b>Welcome to Cat Village Simulator</b><p>To get started, choose the cats who wil join you.</p>`
    const recruitCountSpan = document.createElement("span");
    recruitCountSpan.textContent = "0/3 cats recruited";
    document.getElementById("welcomeScreen")!.appendChild(recruitCountSpan);
    const catGridElement = document.createElement("div");
    catGridElement.classList.add("catGrid");
    document.getElementById("welcomeScreen")!.appendChild(catGridElement);
    const recruitedCats: PartialCat[] = []
    for (let i = 0; i < 12; i++) {
        const catElement = document.createElement("div");
        catElement.classList.add("catBox")
        const cat = randomCat()
        catElement.innerHTML = `<b>${cat.name}</b>
        ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
            return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
        }).join("")}`
        const recruitButton = document.createElement("button");
        recruitButton.textContent = "Recruit";
        catElement.appendChild(recruitButton)
        recruitButton.addEventListener("click", () => {
            const catIndex = recruitedCats.findIndex(currentCat => currentCat.id === cat.id)
            if (catIndex !== -1) {
                recruitButton.textContent = "Recruit"
                recruitedCats.splice(catIndex, 1)
            } else {
                if (recruitedCats.length >= 3) return;
                recruitButton.textContent = "Unrecruit"
                recruitedCats.push(cat)
            }
            recruitCountSpan.textContent = recruitedCats.length + "/3 cats recruited"
            startJourneyButton.textContent = "Start your journey"
        })
        catGridElement.appendChild(catElement)
    }
    const startJourneyButton = document.createElement("button")
    startJourneyButton.textContent = "Start your journey"
    startJourneyButton.classList.add("bigButton")
    document.getElementById("welcomeScreen")!.appendChild(startJourneyButton)
    startJourneyButton.addEventListener("click", () => {
        if (recruitedCats.length < 3) {
            startJourneyButton.textContent = "Start your journey - recruit 3 cats first!"
            return
        }
        cats = recruitedCats.map(cat => ({...cat, role: "Hunter"}))
        document.getElementById("welcomeScreen")!.hidden = true;
        document.getElementById("game")!.hidden = false;
        for (const cat of cats) {
            createCatElement(cat);
        };
        setInterval(tick, 1000);
        for (const technologyItem of technology) {
            setupTechnologyItem(technologyItem)
        }
    })
});

if (!localStorage.getItem("save")) document.getElementById("continue")!.hidden = true;

document.getElementById("continue")?.addEventListener("click", () => {
    const save = JSON.parse(localStorage.getItem("save")!) //, JSON.stringify({researched, cats, foodStock, researchPoints, starvationPoints, comfort, inventory}))
    researched = save.researched;
    cats = save.cats;
    foodStock = save.foodStock;
    researchPoints = save.researchPoints;
    starvationPoints = save.starvationPoints;
    comfort = save.comfort;
    inventory = save.inventory;
    landSize = save.landSize;
    for (const cat of cats) {
        createCatElement(cat);
    };
    for (const technologyItem of technology) {
        setupTechnologyItem(technologyItem);
        if (technologyItem.requires) {
            const canResearch = technologyItem.requires.reduce((l, c) => l && researched[c], true);
            if (canResearch) document.getElementById(technologyItem.id + ".div")!.hidden = false;
        };
        if (technologyItem.id in researched) {
            document.getElementById(technologyItem.id + ".div")!.hidden = true;
        };
    };
    for (const itemId of Object.keys(inventory)) {
        createInventoryElem(itemId)
        const itemSpan = document.getElementById("inventory." + itemId)!
        itemSpan.style.setProperty("--num", inventory[itemId] + "")
        itemSpan.setAttribute("aria-label", inventory[itemId] + "")
    }
    for (const researchId of Object.keys(researched)) {
        researchCallbacks[researchId]();
    }
    for (const cat of cats) {
        const roleSelect = document.getElementById(cat.id + ".roleSelect") as HTMLSelectElement;
        roleSelect.selectedIndex = roles.indexOf(cat.role)
    }
    document.getElementById("titleScreen")!.hidden = true;
    document.getElementById("game")!.hidden = false;
    setInterval(tick, 1000);
});

let raid = false;
let foodStock: number[] = [];
let maxFoodStock = 1000;
let researchPoints = 10000;
let starvationPoints = 0;
let comfort = 0;
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

let landSize = 1;

let inventory: Record<string, number> = {};

inventory.wood = 100000000;

document.getElementById("expand")!.addEventListener("click", () => {
    if (researchPoints < 100 * 3 ** landSize) return;
    researchPoints -= 100 * 3 ** landSize;
    landSize += 1;
})

const sellAmounts = [1, 10, 100];

const createInventoryElem = (id: string) => {
    const itemDiv = document.createElement("div");
    itemDiv.id = "inventory." + id + ".div";
    const itemTopInfo = document.createElement("div")
    itemTopInfo.textContent = `${items.find(item => item.id === id)?.name} (${items.find(item => item.id === id)?.sell} research each): `
    const itemSpan = document.createElement("span")
    itemSpan.classList.add("inventoryItemAmount")
    itemSpan.id = "inventory." + id
    itemTopInfo.appendChild(itemSpan)
    itemDiv.appendChild(itemTopInfo);
    const sellRow = document.createElement("div")
    if (items.find(item => item.id === id)?.usable) {
        const useButton = document.createElement("button");
        useButton.textContent = "Use";
        useButton.addEventListener("click", () => {
            if (inventory[id] > 0) {
                itemUse[id]?.()
                inventory[id] -= 1;
                itemSpan.style.setProperty("--num", inventory[id] + "")
                itemSpan.setAttribute("aria-label", inventory[id] + "");
                if (inventory[id] === 0) {
                    itemDiv.remove();
                }
            }
        })
        sellRow.appendChild(useButton)
    }
    for (const sellAmount of sellAmounts) {
        const sellButton = document.createElement("button");
        sellButton.textContent = "Sell " + sellAmount + "x";
        sellButton.classList.add("sellButton")
        sellButton.dataset.sellAmount = sellAmount + ""
        sellButton.addEventListener("click", () => {
            if (inventory[id] >= sellAmount) {
                inventory[id] -= sellAmount;
                researchPoints += sellAmount * (items.find(item => item.id === id)?.sell ?? 0);
                itemSpan.style.setProperty("--num", inventory[id] + "")
                itemSpan.setAttribute("aria-label", inventory[id] + "");
            }
        })
        sellRow.appendChild(sellButton)
    }
    itemDiv.appendChild(sellRow);
    document.getElementById("inventory")?.appendChild(itemDiv)
}

const tick = () => {
    if (cats.length === 0) {
        document.getElementById("game")!.hidden = true;
        document.getElementById("gameOver")!.hidden = false;
        return;
    }
    let waterLeft = inventory.water_cup ?? 0;
    const foodHunted = Math.min(50 * 2 ** landSize, Math.floor((seasons[season].cold ? 0.1 : 1) * Math.floor(cats.filter(cat => cat.role === "Hunter" && (seasons[season].hot ? --waterLeft > 0 : true)).reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0) * ((comfort / 100) + 1))));
    console.log(waterLeft)
    const requiredFood = cats.length * 10 * (raid ? 1.5 : 1)
    if (foodHunted - requiredFood > 0) {
        if (starvationPoints > 0) {
            starvationPoints -= foodHunted - requiredFood;
            if (starvationPoints < 0) starvationPoints = 0;
        } else {
            foodStock.push(foodHunted - requiredFood);
        }
    }
    if (foodHunted - requiredFood < 0) {
        if (foodStock.length > 0) {
            const difference = requiredFood - foodHunted;
            let takenAway = 0;
            while (takenAway < difference) {
                takenAway += foodStock[0];
                foodStock.splice(0, 1);
                if (takenAway < difference && foodStock.length === 0) {
                    starvationPoints += difference - takenAway;
                    takenAway -= difference
                    break
                };
            };
            if (difference - takenAway > 0) foodStock.unshift(difference - takenAway);
        } else {
            starvationPoints += requiredFood - foodHunted;
        }
    };
    if (foodStock.length > 30) {
        foodStock.splice(0, 1)
    }
    if (foodStock.reduce((l, c, i) => l + c, 0) > maxFoodStock) {
        const totalSurplus = foodStock.reduce((l, c, i) => l + c, 0)
        let takenAway = 0
        while (takenAway < (maxFoodStock - totalSurplus)) {
            takenAway += foodStock[0]
            foodStock.splice(0, 1)
        }
        foodStock.unshift(maxFoodStock - foodStock.reduce((l, c, i) => l + c, 0) - takenAway)
    }
    if (starvationPoints > 500 && Date.now() - lastCatStarve > 9500) {
        lastCatStarve = Date.now();
        const catIndex = Math.floor(Math.random() * cats.length);
        const cat = cats[catIndex];
        cats.splice(catIndex, 1);
        document.getElementById(cat.id + ".catBox")?.remove();
        starvationPoints *= cats.length / (cats.length + 1);
        starvationPoints = Math.ceil(starvationPoints);
        if (starvationPoints > 500) starvationPoints = 500;
    };
    document.getElementById("foodHunted")!.textContent = `${foodHunted}/${requiredFood}`
    const displayFoodStock = starvationPoints > 0 ? -starvationPoints + "" : foodStock.reduce((l, c, i) => l + c, 0) + ""
    document.getElementById("foodStock")!.style.setProperty("--num", displayFoodStock)
    document.getElementById("foodStock")!.setAttribute("aria-label", displayFoodStock)
    const defense = cats.filter(cat => cat.role === "Guard").reduce((l, c, i) => l + Math.floor((c.abilities.strength + c.abilities.agility) / 5), 0)
    document.getElementById("defense")!.textContent = defense + ""
    researchPoints += cats.filter(cat => cat.role === "Researcher").reduce((l, c, i) => l + Math.floor(c.abilities.intelligence * Math.random() * comfort / 5), 0)
    document.getElementById("researchPoints")!.style.setProperty("--num", researchPoints + "")
    document.getElementById("researchPoints")!.setAttribute("aria-label", researchPoints + "")
    document.getElementById("comfort")!.style.setProperty("--num", comfort + "")
    document.getElementById("comfort")!.setAttribute("aria-label", comfort + "")
    if (foodStock.reduce((l, c, i) => l + c, 0) > 500 && Math.random() < 0.01 / defense) {
        document.getElementById("raid")!.hidden = false;
        document.getElementById("raidText")!.textContent = "You are being raided. You will use up 1.5x the amount of prey during the raid."
        document.getElementById("raidTimer")!.textContent = "30s left"
        raid = true
        let timeLeft = 30
        const raidInterval = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                document.getElementById("raid")!.hidden = true;
                raid = false
                clearInterval(raidInterval)
            }
            document.getElementById("raidTimer")!.textContent = timeLeft + "s left"
        }, 1000)
    }
    for (const technologyItem of technology) {
        const technologyElem = document.getElementById(technologyItem.id + ".research") as HTMLButtonElement
        technologyElem.disabled = technologyItem.cost > researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && inventory[id] >= amountRequired, true) : false);
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

    document.getElementById("landSize")!.textContent = landSize + ""
    document.getElementById("maxPrey")!.textContent = 50 * 2 ** landSize + ""
    document.getElementById("expand")!.textContent = "Expand: " + 100 * 3 ** landSize + " research points";
    (document.getElementById("expand") as HTMLButtonElement).disabled = researchPoints < 100 * 3 ** landSize

    if (inventory.water_cup) {
        inventory.water_cup = Math.max(0, waterLeft);
        const waterCupSpan = document.getElementById("inventory.water_cup")!
        waterCupSpan.style.setProperty("--num", inventory.water_cup + "")
        waterCupSpan.setAttribute("aria-label", inventory.water_cup + "")
    }

    const woodGained = cats.filter(cat => cat.role === "Tree Chopper").reduce((l, c, i) => l + Math.floor(Math.random() * 5 * Math.floor(c.abilities.strength / 5)), 0)
    if (woodGained) {
        inventory.wood ??= 0;
        inventory.wood += woodGained;
        if (!document.getElementById("inventory.wood")) {
            createInventoryElem("wood")
        }
        const woodSpan = document.getElementById("inventory.wood")!
        woodSpan.style.setProperty("--num", inventory.wood + "")
        woodSpan.setAttribute("aria-label", inventory.wood + "")
    }
    const stoneGained = cats.filter(cat => cat.role === "Miner").reduce((l, c, i) => l + Math.floor(Math.random() * 5 * Math.floor(c.abilities.strength / 5)), 0)
    if (stoneGained) {
        inventory.stone ??= 0;
        inventory.stone += stoneGained;
        if (!document.getElementById("inventory.stone")) {
            createInventoryElem("stone")
        }
        const stoneSpan = document.getElementById("inventory.stone")!
        stoneSpan.style.setProperty("--num", inventory.stone + "");
        stoneSpan.setAttribute("aria-label", inventory.stone + "");
    };
    for (const item of items) {
        const itemElem = document.getElementById("inventory." + item.id + ".div");
        if (!itemElem) continue;
        itemElem!.querySelectorAll(".sellButton").forEach(sellButton => {
            const sellAmount = +(sellButton as HTMLButtonElement).dataset.sellAmount!;
            (sellButton as HTMLButtonElement).disabled = inventory[item.id] < sellAmount;
        });
    };
    const woodPressOperators = cats.filter(cat => cat.role === "Wood Press Operator").length;
    if (woodPressOperators) {
        const woodenPlanksGained = Math.min(woodPressOperators, inventory.wood_press ?? 0, Math.floor(inventory.wood / 500));
        inventory.wooden_plank ??= 0;
        inventory.wooden_plank += woodenPlanksGained;
        if (!document.getElementById("inventory.wooden_plank")) {
            createInventoryElem("wooden_plank");
        };
        const woodPlankSpan = document.getElementById("inventory.wooden_plank")!
        woodPlankSpan.style.setProperty("--num", inventory.wooden_plank + "");
        woodPlankSpan.setAttribute("aria-label", inventory.wooden_plank + "");
        inventory.wood -= woodenPlanksGained * 500;
    };
    localStorage.setItem("save", JSON.stringify({researched, cats, foodStock, researchPoints, starvationPoints, comfort, inventory, landSize}));
}