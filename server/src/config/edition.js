const edition = () => process.env.POSTSALES_EDITION || 'internal_dev';

const isCustomerLocal = () => edition() === 'customer_local';

const commercialName = () =>
  isCustomerLocal()
    ? 'Post-Sales IoT Local Server Edition'
    : 'Post-Sales IoT Internal Dev Edition';

module.exports = {
  edition,
  isCustomerLocal,
  commercialName,
};
