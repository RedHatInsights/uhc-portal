export const getCurrentOpenshiftVersion = () => {
  return cy
    .request(
      'https://access.redhat.com/product-life-cycles/api/v1/products?name=Openshift+Container+Platform+4',
    )
    .then((response) => {
      const currentVersion = response.body.data[0].versions[0].name;
      return currentVersion;
    });
};
