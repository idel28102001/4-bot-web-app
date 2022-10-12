const rateDict = { RUB: '₽' };

const createItem = ({ title, price, oldPrice, imgHref, rate = 'RUB', id }) => {
  const href = `single.html?id=${id}`;

  const listItem = document.createElement('div');
  const product = document.createElement('div');
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const desc = document.createElement('div');
  const h3 = document.createElement('h3');
  const a = document.createElement('a');
  const p = document.createElement('p');
  const priceElem = document.createElement('span');
  const oldPriceElem = document.createElement('span'); //
  const extra = document.createElement('a');

  listItem.classList.add('col-md-4', 'col-xs-6');
  product.classList.add('product');
  desc.classList.add('desc');
  priceElem.classList.add('price');
  oldPriceElem.classList.add('price', 'price-old');
  extra.classList.add('btn', 'btn-primary', 'btn-outline');

  listItem.append(product);
  figure.append(img);
  h3.append(a);
  p.append(priceElem);
  if (oldPrice) {
    p.append(oldPriceElem);
  }
  desc.append(h3, p, extra);
  product.append(figure, desc);

  h3.innerText = title;
  a.href = href;
  priceElem.innerText = `${Number(price).toFixed(2)}${rateDict[rate]}`;
  oldPriceElem.innerText = `${Number(oldPrice).toFixed(2)}${rateDict[rate]}`;
  img.src = imgHref;
  extra.innerText = 'Подробнее';
  extra.href = href;
  return listItem;
};

const createCategory = ({ title }) => {
  const category = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.classList.add('category-title');
  category.prepend(h2);
  if (!isNaN(title)) {
    h2.innerText = '';
  } else {
    h2.innerText = title;
  }
  if (title == 'Выключить') {
    h2.innerText = '';
  }

  return category;
};

const getAllItems = async () => {
  let results = await fetch('/api/table/csv/json?limit=1000&offset=0');
  results = await results.json();

  return results;
};

const getAllCategories = async () => {
  let result = await fetch('api/table/categories/');
  result = await result.json();

  return result;
};

const init = async () => {
  const store = document.getElementById('products');
  //Сдесь должен быть лоадинг
  let categories = await getAllCategories();

  let items = await getAllItems();

  categories.map((category) => {
    const categoryItems = items.filter(
      (item) => item.category && item.category._id === category._id,
    );
    let categoryHtml = createCategory({
      title: category.name,
      id: category.id,
      ids: category._id,
    });
    categoryItems.map((categoryItem) => {
      let itemHtml = createItem({
        title: categoryItem.name,
        oldPrice: categoryItem.oldprice,
        price: categoryItem.price,
        imgHref: categoryItem.pictures[0],
        // rate: categoryItem.currency.id,
        id: categoryItem._id,
      });
      categoryHtml.append(itemHtml);
    });
    store.append(categoryHtml);
  });
};
init();
