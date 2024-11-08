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
    }
];
let recruitmentCooldown = 60;
const researchCallbacks: Record<string, () => void> = {
    "basic_recruitment": () => {
        document.getElementById("toolsNotUnlocked")!.hidden = true;
        const recruitToolButton = document.createElement("button");
        recruitToolButton.textContent = "Recruit";
        document.getElementById("toolsBox")!.appendChild(recruitToolButton);
        recruitToolButton.addEventListener("click", () => {
            if (document.getElementById("recruitmentDiv")) return;
            const recruitmentDiv = document.createElement("div");
            recruitmentDiv.id = "recruitmentDiv";
            recruitmentDiv.innerHTML = `<b>Recruitment</b>
            <p>You go and put up a poster for recruitment. One of the candidates stand out. Would you like to recruit them?</p>`;
            document.getElementById("rightSide")!.appendChild(recruitmentDiv);
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
                recruitmentDiv.remove();
                (cat as Cat).role = "Hunter";
                createCatElement(cat as Cat);
                cats.push(cat as Cat);
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
            });
            recruitmentDiv.appendChild(catElement);
        });
    },
    "recruitment_propaganda": () => {
        recruitmentCooldown = 45;
    }
};
const researched: Record<string, boolean> = {};
let cats: Cat[] = [];
const createCatElement = (cat: Cat) => {
    const catElement = document.createElement("div");
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
            <span>Cost: ${technologyItem.cost} research points</span>`;
            if (technologyItem.requires) technologyElem.hidden = true;
            const researchButton = document.createElement("button");
            researchButton.textContent = "Research";
            researchButton.disabled = true;
            researchButton.id = technologyItem.id + ".research";
            researchButton.addEventListener("click", () => {
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
let researchPoints = 50;
const tick = () => {
    const foodHunted = cats.filter(cat => cat.role === "Hunter").reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0);
    const requiredFood = cats.length * 10 * (raid ? 1.5 : 1)
    if (foodHunted - requiredFood > 0) foodStock.push(foodHunted - requiredFood);
    if (foodHunted - requiredFood < 0) {
        const difference = requiredFood - foodHunted;
        let takenAway = 0;
        while (takenAway < difference) {
            takenAway += foodStock[0];
            foodStock.splice(0, 1);
            if (takenAway < difference && foodStock.length === 0) {
                document.getElementById("game")!.hidden = true;
                document.getElementById("gameOver")!.hidden = false;
                return;
            };
        };
        foodStock.unshift(difference - takenAway);
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
    document.getElementById("foodHunted")!.textContent = `${foodHunted}/${requiredFood}`
    document.getElementById("foodStock")!.style.setProperty("--num", foodStock.reduce((l, c, i) => l + c, 0) + "")
    document.getElementById("foodStock")!.setAttribute("aria-label", foodStock.reduce((l, c, i) => l + c, 0) + "")
    document.getElementById("defense")!.textContent = cats.filter(cat => cat.role === "Guard").reduce((l, c, i) => l + Math.floor((c.abilities.strength + c.abilities.agility) / 5), 0) + ""
    researchPoints += cats.filter(cat => cat.role === "Researcher").reduce((l, c, i) => l + Math.floor(c.abilities.intelligence * Math.random() / 5), 0)
    document.getElementById("researchPoints")!.style.setProperty("--num", researchPoints + "")
    document.getElementById("researchPoints")!.setAttribute("aria-label", researchPoints + "")
    if (foodStock.reduce((l, c, i) => l + c, 0) > 500 && Math.random() < 0.01) {
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
        technologyElem.disabled = technologyItem.cost > researchPoints;
    }
}