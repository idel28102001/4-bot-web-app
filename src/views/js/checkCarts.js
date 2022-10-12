const cart = document.getElementById('small-cart');

const count = JSON.parse(localStorage.getItem('cart')) || [];
let sum = 0;
count.forEach((e) => {
  sum += e.count;
});
cart.innerText = sum;

export const updateCart = ({ name, elements }) => {
  localStorage.setItem(name, JSON.stringify(elements));
};

export const getCart = ({ name }) => {
  return JSON.parse(localStorage.getItem(name)) || [];
};

export const updateSmall = ({ name }) => {
  const result = getCart({ name });
  document.getElementById('cart').innerText = result.length;
};

export const updateSmallCart = () => {
  const cart = document.getElementById('small-cart');
  const all = getCart({ name: 'cart' });
  let sum = 0;
  all.forEach((e) => {
    sum += e.count;
  });
  cart.innerText = sum;
};
