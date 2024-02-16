import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

const style = `<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: sans-serif;
    font-size: 1.75rem;
  }
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 1rem 0;
    background-color: hsl(216, 12%, 8%);
    color: hsl(0, 0%, 100%);
  }
  .container {
    max-width: 850px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .card {
    width: 100%;
    background-color: hsl(213, 19%, 18%);
    border-radius: 1.5rem;
  }
  .card p {
    text-align: center;
    margin: 1rem 3rem;
  }
  .price {
    color: hsl(217, 12%, 63%);
    font-size: 1.25rem
  }
  .btn {
    display: flex;
    justify-content: center;
    margin: 1rem auto;
    border: none;
    border-radius: 0.5rem;
    transition: border-radius 150ms;
    width: 5rem;
    padding: 0.75rem 0;
    background-color: hsl(25, 97%, 53%);
    color: hsl(0, 0%, 100%);
  }
  .btn:hover {
    border-radius: 1.25rem;
    background-color: hsl(0, 0%, 100%);
    color: hsl(25, 97%, 53%);
  }
</style>`;

app.get('/', async (req, res) => {
  const products = await getProducts();
  const markup = products
    .map(
      (p) =>
        `<div class="card">
          <p class="title">${p.title}</p>
          <p class="price">${p.price} kr</p>
          <button class="btn" onclick="window.location.href='/product/${p.id}'">
            <strong>Buy</strong>
          </button>
        </div>`
    )
    .join(' ');
  const wrapperMarkup = `${style}<div class="container">${markup}</div>`;
  res.send(wrapperMarkup);
});

app.get('/product/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    const klarnaJsonResponse = await createOrder(product);
    const html_snippet = klarnaJsonResponse.html_snippet;
    res.send(html_snippet);
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/confirmation', async function (req, res) {
  const order_id = req.query.order_id;
  const klarnaJsonResponse = await retrieveOrder(order_id);
  const html_snippet = klarnaJsonResponse.html_snippet;
  res.send(html_snippet);
});

app.listen(process.env.PORT);
