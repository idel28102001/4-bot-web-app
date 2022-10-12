import { getCart, updateCart, updateSmallCart } from './checkCarts.js';

const rateDict = { RUB: '₽' };
const id = new URLSearchParams(location.search).get('id');
const createTitle = ({ title }) => {
  const div = document.createElement('div');
  const product = document.createElement('div');
  const h2 = document.createElement('h2');
  div.classList.add('col-lg-12');
  product.classList.add('fh5co-heading', 'product');

  h2.innerText = title;
  product.append(h2);
  div.append(product);
  return div;
};

const createImg = ({ imgHref = '' }) => {
  const img = document.createElement('img');

  img.src = imgHref;

  return img;
};

const createWrapper = () => {
  const toCart = document.createElement('div');
  const span = document.createElement('span');

  toCart.classList.add(
    'col-md-8',
    'col-md-offset-2',
    'text-center',
    'fh5co-heading',
  );
  span.classList.add('btn', 'btn-primary', 'btn-outline');

  span.textContent = 'В корзину';

  toCart.append(span);

  const minus = document.createElement('span');
  const input = document.createElement('span');
  const plus = document.createElement('span');
  const div = document.createElement('div');

  minus.classList.add('minus');
  plus.classList.add('plus');
  div.classList.add('number');

  const cartList = getCart({ name: 'cart' });
  const currDict = cartList.find((e) => e.id === id) || { id, count: 0 };

  minus.innerText = '-';
  plus.innerText = '+';
  div.append(minus, input, plus);
  if (currDict.count > 0) {
    input.innerText = currDict.count;
    span.style.display = 'block';
  } else {
    div.style.display = 'block';
    input.innerText = 1;
  }
  toCart.append(div);

  const elemFunc = (list, elem, currDict) => {
    if (!elem) {
      list.push(currDict);
      updateCart({ name: 'cart', elements: list });
    } else {
      const index = list.indexOf(elem);
      if (currDict.count === 0) {
        list.pop(index);
      } else {
        list[index] = currDict;
      }
      updateCart({ name: 'cart', elements: list });
    }
  };

  plus.addEventListener('click', () => {
    const num = Number(input.innerText) + 1;
    input.innerText = num;
  });

  minus.addEventListener('click', () => {
    const num = Number(input.innerText) - 1;
    if (num === 0) {
      div.style.display = 'block';
      span.style.display = '';
      span.textContent = 'В корзину';
      span.style.border = '';
      span.style.color = '';
      span.style.pointerEvents = '';
    }
    input.innerText = num;
    currDict.count = num;
    const list = getCart({ name: 'cart' });
    const elem = list.find((e) => e.id === id);
    elemFunc(list, elem, currDict);
    updateSmallCart();
  });
  span.addEventListener('click', () => {
    const num = Number(input.innerText);
    input.innerText = num;
    currDict.count = num;
    const list = getCart({ name: 'cart' });
    const elem = list.find((e) => e.id === id);
    currDict.modification = document.querySelector('#modificationSelect').value;
    currDict.offerId = itemOfferId;
    elemFunc(list, elem, currDict);
    updateSmallCart();
    div.style.display = 'none';
    span.style.display = 'block';
    span.style.border = '1px solid grey';
    span.style.pointerEvents = 'none';
    span.style.color = 'grey';
    currDict.count = 0;
    span.textContent = 'В корзине';
  });
  return toCart;
};

const createDescr = ({
  params = [],
  oldPrice,
  price,
  description,
  rate = 'RUB',
  modifications = {},
  modificationsValue = [],
}) => {
  const product = document.createElement('div');
  const p = document.createElement('p');
  const priceElem = document.createElement('span');
  const oldPriceElem = document.createElement('span');
  const descr = document.createElement('p');
  const h3 = document.createElement('h3');
  const ul = document.createElement('ul');
  const select = document.createElement('select');
  const selectTitle = document.createElement('span');

  product.classList.add('col-md-8', 'col-sm-12', 'product-desc');
  priceElem.classList.add('price');
  oldPriceElem.classList.add('price', 'price-old');
  select.classList.add('select-size');
  select.setAttribute('id', 'modificationSelect');

  select.addEventListener('change', function () {
    itemOfferId = modificationsValue[this.value].offerId;
  });

  product.append(selectTitle);
  product.append(select);

  selectTitle.innerText = `${modifications}:`;
  priceElem.innerText = `${Number(price).toFixed(2)}${rateDict[rate]}`;
  oldPriceElem.innerText = `${Number(oldPrice).toFixed(2)}${rateDict[rate]}`;
  descr.innerHTML = description;

  if (
    typeof modificationsValue !== 'undefined' &&
    modificationsValue.length == 0
  ) {
    selectTitle.style.display = 'none';
  }

  modificationsValue.forEach((e, index) => {
    const option = document.createElement('option');
    option.innerText = `${e.value}`;
    option.value = `${index}`;
    select.append(option);
  });

  params.forEach((e) => {
    const li = document.createElement('li');
    li.innerText = `${e.name}: ${e.text}`;
    ul.append(li);
  });
  p.append(priceElem);
  if (oldPrice) {
    p.append(oldPriceElem);
  }
  product.append(p, descr, h3, ul);
  return product;
};
let itemOfferId = null;
const res = document.querySelector('#fh5co-product .row');
fetch(`/api/table/csv/json/${id}`)
  .then((e) => e.json())
  .then((e) => {
    const wrapper = createWrapper();
    const title = createTitle({ title: e.name });
    const figure = document.createElement('figure');
    const btnRight = document.createElement('span');
    btnRight.innerText = '→';
    let slides = [];
    let i = 0; // Объявляем переменную i
    btnRight.addEventListener('click', function () {
      // Объявляем событие нажатия на кнопку вперёд
      ++i; // Увеличиваем переменную i
      if (i >= slides.length) {
        // Условие если переменная i больше или равна количеству слайдов
        slides[i - 1].classList.remove('block'); // Удаляем класс block предыдущему слайду
        i = 0; // Присваиваем переменной i ноль
        slides[i].classList.add('block'); // Добавляем класс block следующему слайду
      } else {
        slides[i - 1].classList.remove('block'); // Удаляем класс block предыдущему слайду
        slides[i].classList.add('block'); // Добавляем класс block следующему слайду
      }
    });
    e.pictures.map((e, index) => {
      const photo = createImg({ imgHref: e, index: index });
      if (index == 0) {
        photo.classList.add('block');
      }
      figure.append(photo);
      figure.append(btnRight);
      slides.push(photo);
    });
    const descr = createDescr({
      oldPrice: e.oldprice,
      price: e.price,
      description: e.description,
      rate: e.modifications.offerId,
      params: e.params,
      modifications: e.modifications.text,
      modificationsValue: e.modifications.values,
    });

    itemOfferId = e.offerId;

    res.append(title, figure, wrapper, descr);
  });
