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

const technology = [
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
        "requires": ["basic_recruitment"]
    },
    {
        "name": "Basic Den",
        "description": "A basic den for cats to sleep in.",
        "id": "basic_den",
        "cost": 300,
        "resource_cost": {
            "wood": 500
        },
        "requires": ["tree_chopper"]
    }
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
    }
]
const craftable: string[] = [];
let recruitmentCooldown = 60;
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
            document.getElementById("rightSide")!.appendChild(recruitmentDiv);
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
        recruitmentCooldown = 45;
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
            document.getElementById("rightSide")!.appendChild(craftingDiv);
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
                const craftButton = document.createElement("button");
                craftButton.textContent = "Craft"
                recipeDiv.appendChild(craftButton);
                recipeListDiv.appendChild(recipeDiv)
                craftButton.addEventListener("click", () => {
                    const craftable = Object.entries(recipe.resources).reduce((l, [itemId, quantity]) => l && inventory[itemId] >= quantity, true);
                    if (!craftable) return craftButton.textContent = "Craft - unaffordable!"
                    for (const [itemId, quantity] of Object.entries(recipe.resources)) {
                        inventory[itemId] -= quantity;
                        const itemSpan = document.getElementById("inventory." + itemId)!;
                        itemSpan.style.setProperty("--num", inventory[itemId] + "")
                        itemSpan.setAttribute("aria-label", inventory[itemId] + "");
                    }
                    inventory[recipe.result] ??= 0;
                    inventory[recipe.result] += 1;
                    
                    if (!document.getElementById("inventory." + recipe.result)) {
                        createInventoryElem(recipe.result)
                    }
                    const woodSpan = document.getElementById("inventory." + recipe.result)!
                    woodSpan.style.setProperty("--num", inventory[recipe.result] + "")
                    woodSpan.setAttribute("aria-label", inventory[recipe.result] + "")
                })
            }
        })
    }
};
const items = [
    {
        "id": "wood",
        "name": "Wood",
        "sell": 1
    },
    {
        "id": "basic_den",
        "name": "Basic Den",
        "sell": 100,
        "usable": true
    }
];
const itemUse: Record<string, () => void> = {
    "basic_den": () => {
        comfort += 1;
    }
}
const createNewRole = (roleName: string) => {
    roles.push(roleName)
    for (const cat of cats) {
        const catElement = document.getElementById(cat.id + ".catBox")!;
        const roleOption = document.createElement("option")
        roleOption.textContent = roleName;
        catElement.querySelector("select")?.appendChild(roleOption);
    }
}
const researched: Record<string, boolean> = {};
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
document.getElementById("start")?.addEventListener("click", () => {
    console.log("click")
    document.getElementById("titleScreen")!.hidden = true;
    document.getElementById("welcomeScreen")!.innerHTML = `<b>Welcome to Cat Village Simulator</b><p>To get started, choose the cats who wil join you.</p>`
    const recruitCountSpan = document.createElement("span")
    recruitCountSpan.textContent = "0/3 cats recruited"
    document.getElementById("welcomeScreen")!.appendChild(recruitCountSpan)
    const catGridElement = document.createElement("div")
    catGridElement.classList.add("catGrid")
    document.getElementById("welcomeScreen")!.appendChild(catGridElement)
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
            const technologyElem = document.createElement("div");
            technologyElem.id = technologyItem.id + ".div";
            technologyElem.innerHTML = `<b>${technologyItem.name}</b>
            <p>${technologyItem.description}</p>
            <span>Cost: ${technologyItem.cost} research points${technologyItem.resource_cost ? "<br/>" + Object.entries(technologyItem.resource_cost).map(([id, quantity]) => 
                items.find(item => item.id === id)?.name + ": " + quantity
            ).join("<br/>") : ""}</span>`;
            if (technologyItem.requires) technologyElem.hidden = true;
            const researchButton = document.createElement("button");
            researchButton.textContent = "Research";
            researchButton.disabled = true;
            researchButton.id = technologyItem.id + ".research";
            researchButton.addEventListener("click", () => {
                if (technologyItem.cost > researchPoints && (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && inventory[id] >= amountRequired, true) : false)) return;
                researchPoints -= technologyItem.cost;
                researched[technologyItem.id] = true;
                technologyElem.hidden = true;
                researchCallbacks[technologyItem.id]();
                for (const technologyNextItem of technology) {
                    if (!technologyNextItem.requires || !technologyNextItem.requires.includes(technologyItem.id)) continue;
                    document.getElementById(technologyNextItem.id + ".div")!.hidden = false;
                };
            })
            technologyElem.appendChild(researchButton);
            document.getElementById("technologyList")?.appendChild(technologyElem)
        }
    })
});

let raid = false;
let foodStock = [];
let maxFoodStock = 1000;
let researchPoints = 1000;
let starvationPoints = 0;
let comfort = 0;
let lastCatStarve = Date.now();

const inventory: Record<string, number> = {};

const sellAmounts = [1, 10, 100]

const createInventoryElem = (id: string) => {
    const itemDiv = document.createElement("div");
    itemDiv.id = "inventory." + id + ".div"
    const itemTopInfo = document.createElement("div")
    itemTopInfo.textContent = `${items.find(item => item.id === id)?.name} (${items.find(item => item.id === id)?.sell} research each): `
    const itemSpan = document.createElement("span")
    itemSpan.classList.add("inventoryItemAmount")
    itemSpan.id = "inventory." + id
    itemTopInfo.appendChild(itemSpan)
    itemDiv.appendChild(itemTopInfo);
    const sellRow = document.createElement("div")
    if (items.find(item => item.id === id)?.usable) {
        itemUse[id]?.();
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
    const foodHunted = Math.floor(cats.filter(cat => cat.role === "Hunter").reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0) * ((comfort + 1) / 100));
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
    researchPoints += cats.filter(cat => cat.role === "Researcher").reduce((l, c, i) => l + Math.floor(c.abilities.intelligence * Math.random() / 5), 0)
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
        technologyElem.disabled = technologyItem.cost > researchPoints && (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && inventory[id] >= amountRequired, false) : false);
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
    for (const item of items) {
        const itemElem = document.getElementById("inventory." + item.id + ".div");
        if (!itemElem) continue;
        itemElem!.querySelectorAll(".sellButton").forEach(sellButton => {
            const sellAmount = +(sellButton as HTMLButtonElement).dataset.sellAmount!;
            (sellButton as HTMLButtonElement).disabled = inventory[item.id] < sellAmount;
        })
    }
}