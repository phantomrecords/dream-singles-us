function changeLife(lifeId, amount) {
  const lifeElement = document.getElementById(lifeId);
  let currentLife = parseInt(lifeElement.innerText);
  currentLife += amount;
  lifeElement.innerText = currentLife;
}
