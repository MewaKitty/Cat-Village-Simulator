import { game } from "./game.ts";
import { randomCat, abilities, createCatElement } from "./cats.ts";
import type { Cat } from "./cats.ts";

export const showRecruitmentMenu = () => {
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
                recruitToolButton.textContent = "Recruit - " + (game.recruitmentCooldown - secsPassed) + "s left";
                if (secsPassed >= game.recruitmentCooldown) {
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
            (cat as Cat).skills = {};
            createCatElement(cat as Cat);
            game.cats.push(cat as Cat);
            closeRecruit();
        });
        recruitmentDiv.appendChild(catElement);
    });
}