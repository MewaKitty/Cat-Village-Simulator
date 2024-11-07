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

const roles = ["Hunter", "Guard"]
let cats: Cat[] = []
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
            const catElement = document.createElement("div")
            catElement.classList.add("catBox")
            catElement.innerHTML = `<b>${cat.name}</b>
            ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
                return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
            }).join("")}`
            document.getElementById("catList")?.appendChild(catElement)
            const roleSelect = document.createElement("select")
            for (const role of roles) {
                const roleOption = document.createElement("option")
                roleOption.textContent = role
                roleSelect.appendChild(roleOption)
            }
            catElement.appendChild(roleSelect)
            roleSelect.addEventListener("change", () => {
                cat.role = roleSelect.options[roleSelect.selectedIndex].text;
            })
        }
        setInterval(tick, 1000)
    })
});

(document.getElementsByClassName("test")[0] as HTMLElement).style.setProperty("--num", "0")
setTimeout(() => 
    (document.getElementsByClassName("test")[0] as HTMLElement).style.setProperty("--num", "100"), 1000)
setTimeout(() => 
    (document.getElementsByClassName("test")[0] as HTMLElement).style.setProperty("--num", "50"), 2000)
let raid = false;
let foodStock = [];
let maxFoodStock = 1000;
const tick = () => {
    const foodHunted = cats.filter(cat => cat.role === "Hunter").reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0)
    const requiredFood = cats.length * 10 * (raid ? 2 : 1)
    foodStock.push(Math.floor((foodHunted - requiredFood) / 2))
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
        foodStock.unshift(Math.min(takenAway, maxFoodStock - foodStock.reduce((l, c, i) => l + c, 0)))
    }
    document.getElementById("foodHunted")!.textContent = `${foodHunted}/${requiredFood}`
    document.getElementById("foodStock")!.style.setProperty("--num", foodStock.reduce((l, c, i) => l + c, 0) + "")
    document.getElementById("foodStock")!.setAttribute("aria-label", foodStock.reduce((l, c, i) => l + c, 0) + "")
    document.getElementById("defense")!.textContent = cats.filter(cat => cat.role === "Guard").reduce((l, c, i) => l + Math.floor(c.abilities.strength / 5), 0) + ""
    if (Math.random() < 0.1) {
        document.getElementById("raid")!.hidden = false;
        document.getElementById("raidText")!.textContent = "You are being raided. You will use up twice the amount of prey during the raid."
        document.getElementById("raidTimer")!.textContent = "30s left"
        raid = true
        let timeLeft = 30
        setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                document.getElementById("raid")!.hidden = true;
                raid = false
            }
            document.getElementById("raidTimer")!.textContent = timeLeft + "s left"
        }, 1000)
    }
}