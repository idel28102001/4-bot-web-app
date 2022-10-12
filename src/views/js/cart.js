import {
  getCart,
  updateCart,
  updateSmall,
  updateSmallCart,
} from './checkCarts.js';

const cart = getCart({ name: 'cart' });
const checkIfAllOk = () => {
  const phone = document.getElementById('subject');
  const name = document.getElementById('name');
  const some = getCart({ name: 'cart' });
  const button = document.getElementById('button-order');
  if (
    /\+?\d{11}/.test(phone.value.replaceAll(' ', '')) &&
    name.value.length > 0 &&
    some.length
  ) {
    button.classList.remove('none-click');
  } else {
    button.classList.add('none-click');
  }
};

const h2 = document.getElementById('h2');
h2.innerHTML = 'Корзина';

let offerId;

const rateDict = { RUB: '₽' };
const createElem = ({
  id,
  src,
  title,
  price,
  rate,
  modifications,
  modificationsValue,
}) => {
  const currCart = cart.find((e) => e.id === id);

  offerId = modificationsValue || modifications;

  const row = document.createElement('div');
  const img = document.createElement('img');
  const div = document.createElement('div');
  const h4 = document.createElement('h4');
  const countElem = document.createElement('div');
  const number = document.createElement('div');
  const minus = document.createElement('span');
  const input = document.createElement('input');
  const plus = document.createElement('span');
  const total = document.createElement('p');
  const totalNum = document.createElement('span');
  const remove = document.createElement('span');

  row.append(img, div);
  div.append(h4, number);
  number.append(countElem, total);
  const pr = `${currCart.count * Number(price).toFixed(2)}${rateDict['RUB']}`;
  totalNum.innerText = `Итог: ${pr}`;
  total.append(totalNum, remove);
  countElem.append(minus, input, plus);

  row.classList.add('cart-table-row');
  number.classList.add('number');
  minus.classList.add('minus');
  plus.classList.add('plus');
  remove.classList.add('cbtn', 'btn-remove');

  img.src = src;
  h4.textContent = title;
  input.type = 'text';
  input.value = currCart.count;
  remove.textContent = 'x';
  minus.innerText = '-';
  plus.innerText = '+';

  const updateFunc = ({ count, price, id }) => {
    currCart.count = Number(count);
    const index = cart.indexOf(currCart);
    cart[index] = currCart;
    updateCart({ name: 'cart', elements: cart });
    updateSmallCart({ name: 'cart' });
    const pr = `${(count || 0) * Number(price).toFixed(2)}${rateDict['RUB']}`;
    totalNum.innerText = `Итого: ${pr}`;
    checkIfAllOk();
  };
  new Cleave(input, { numeral: true, numeralPositiveOnly: true });
  input.addEventListener('input', (e) => {
    updateFunc({ count: input.value, price, id });
  });

  minus.addEventListener('click', () => {
    if (input.value !== '0') {
      input.value = `${Number(input.value) - 1}`;
    }
    if (input.value === '0') {
      h2.innerHTML = 'Корзина пустая';
    }
    updateFunc({ count: input.value, price, id });
  });
  plus.addEventListener('click', () => {
    input.value = `${Number(input.value) + 1}`;
    h2.innerHTML = 'Корзина';
    updateFunc({ count: input.value, price, id });
  });

  remove.addEventListener('click', () => {
    const index = cart.indexOf(currCart);
    cart.pop(index);
    updateCart({ name: 'cart', elements: cart });
    updateSmallCart({ name: 'cart' });
    h2.innerHTML = 'Корзина пустая';
    row.remove();
    checkIfAllOk();
  });

  return row;
};

const phone = document.getElementById('subject');
phone.addEventListener('click', () => {
  checkIfAllOk();
  phone.classList.remove('danger');
});

phone.addEventListener('input', () => {
  checkIfAllOk();
});
const name = document.getElementById('name');
name.addEventListener('input', () => {
  checkIfAllOk();
});
name.addEventListener('click', () => {
  checkIfAllOk();
  name.classList.remove('danger');
});
new Cleave(phone, { phone: true, phoneRegionCode: 'RU' });
const table = document.getElementById('cart-table');
(async () => {
  const result = await Promise.all(
    cart.map(async (elem) => {
      console.log(elem);
      const modificationIndex = elem.modification;
      const currElem = await fetch(`/api/table/csv/json/${elem.id}`).then((e) =>
        e.json(),
      );
      return createElem({
        id: elem.id,
        src: currElem.pictures[0],
        price: currElem.price,
        modifications: currElem.offerId,
        title: currElem.name,
        size: currElem.values,
        modificationsValue:
          currElem.modifications.values[modificationIndex].offerId,
      });
    }),
  );
  result.forEach((e) => {
    table.append(e);
  });
  const button = document.getElementById('button-order');
  button.addEventListener('click', () => {
    const name = document.getElementById('name');
    if (name.value.length < 1) {
      name.classList.add('danger');
      return;
    }
    let phone = document.getElementById('subject');
    const value = phone.value.replaceAll(' ', '');
    if (value.startsWith('8') || value.startsWith('+7')) {
      if (!/\+?\d{11}/.test(value)) {
        phone.classList.add('danger');
        return;
      }
    } else {
      if (value.length < 10) {
        phone.classList.add('danger');
        return;
      }
    }

    const cart = getCart({ name: 'cart' });
    let count = 0;
    cart.forEach((e) => {
      count += e.count;
    });
    if (!count) return;
    button.classList.add('none-click');
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        phone: phone.value.replaceAll(' ', ''),
        name: name.value,
        orders: cart,
        offerId: offerId,
      }),
    }).then((e) => {
      button.classList.remove('none-click');
      window.location.href = '/thanks.html';
      updateCart({ name: 'cart', elements: [] });
      updateSmallCart({ name: 'cart' });
    });
  });
})();
