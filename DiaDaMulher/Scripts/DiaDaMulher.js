document.addEventListener("DOMContentLoaded", function () {

/* CONTADOR */

const inicio = new Date("2025-01-25T00:00:00")

function atualizarTempo(){

const agora = new Date()

let anos = agora.getFullYear() - inicio.getFullYear()
let meses = agora.getMonth() - inicio.getMonth()
let dias = agora.getDate() - inicio.getDate()

if(dias < 0){
meses--
dias += 30
}

if(meses < 0){
anos--
meses += 12
}

const diff = agora - inicio

const horas = Math.floor((diff / (1000*60*60)) % 24)
const minutos = Math.floor((diff / (1000*60)) % 60)
const segundos = Math.floor((diff / 1000) % 60)

const elemento = document.getElementById("tempo")

if(elemento){
elemento.innerHTML =
anos + " anos • " +
meses + " meses • " +
dias + " dias<br>" +
horas + " horas • " +
minutos + " minutos • " +
segundos + " segundos"
}

}

atualizarTempo()
setInterval(atualizarTempo,1000)


/* SLIDESHOW */

let imagens = document.querySelectorAll("#slideshow img")
let index = 0

function mostrarImagem(){

imagens.forEach(img => img.classList.remove("active"))

imagens[index].classList.add("active")

index++

if(index >= imagens.length){
index = 0
}

}

mostrarImagem()
setInterval(mostrarImagem,3000)

})