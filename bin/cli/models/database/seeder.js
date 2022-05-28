const seed = async (coca) => {
  const User = coca.models.user;

  await User.create({
    username: 'basicUser',
  });
};

module.exports = seed;
