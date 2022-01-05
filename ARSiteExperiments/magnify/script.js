const images = [
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_1.jpg?v=1621898216288",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_11.jpg?v=1621898215764",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_8.jpg?v=1621898215840",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_19.jpg?v=1621898214082",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_9.jpg?v=1621898213745",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_3.jpg?v=1621898214563",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_5.jpg?v=1621898214636",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_13.jpg?v=1621898214872",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_4.jpg?v=1621898214932",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_12.jpg?v=1621898215111",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_17.jpg?v=1621898215134",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_10.jpg?v=1621898215198",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_2.jpg?v=1621898215401",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_14.jpg?v=1621898215418",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_15.jpg?v=1621898215494",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_7.jpg?v=1621898215532",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_18.jpg?v=1621898215568",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_21.jpg?v=1621898215701",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_6.jpg?v=1621898216573",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_20.jpg?v=1621898215814",
  "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fimage_16.jpg?v=1621898217322"
];

const counterTag = document.querySelector("section div.counter");
const sectionTag = document.querySelector("section");
let i = 0;

function placeImage(x, y) {
  const nextImage = images[i];
  const img = document.createElement("img");
  img.setAttribute("src", nextImage);
  i += 1;

  if (i <= images.length) {
    img.style.top = `${y}px`;
    img.style.left = `${x}px`;
    img.style.transform = `translate(-50% , -50%) scale(0.5) rotate(${Math.random() *
      20 -
      10}deg)`;

    counterTag.innerHTML = `${i} / ${images.length}`;
    //   	section.appendChild(img)
    sectionTag.appendChild(img);
    const audio = document.createElement("audio");
    audio.setAttribute("src", "https://cdn.glitch.com/7a0b927e-8c3d-4459-95fc-c50aa4bc32a5%2Fplop.mp3?v=1621898220729");
    audio.play();
  } else return;
}

sectionTag.addEventListener("click", function(event) {
  event.preventDefault();
  placeImage(event.pageX, event.pageY);
});
