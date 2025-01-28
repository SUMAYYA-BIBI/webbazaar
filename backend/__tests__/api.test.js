const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to a test database
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_ecommerce');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should login existing user', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Product Endpoints', () => {
  let token;
  let productId;

  beforeAll(async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    token = loginRes.body.token;
  });

  it('should create a new product', async () => {
    const res = await request(app)
      .post('/addproduct')
      .set('auth-token', token)
      .send({
        name: 'Test Product',
        category: 'test',
        price: 99.99,
        description: 'Test description'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    productId = res.body.product._id;
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/allproducts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/updateproduct/${productId}`)
      .set('auth-token', token)
      .send({
        name: 'Updated Product',
        price: 199.99
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/removeproduct/${productId}`)
      .set('auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
