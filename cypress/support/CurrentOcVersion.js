class CurrentOcVersion {
  #version;

  getVersion() {
    return this.#version;
  }

  retrieveVersion() {
    if (this.#version) return;
    cy.request({
      url: 'https://access.redhat.com/product-life-cycles/api/v2/products?name=Red+Hat+OpenShift+Container+Platform',
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      this.#version = resp.body.data[0].versions
        .map((k) => k.name)
        .reduce((v1, v2) => {
          const nv1 = v1.split('.').map((x) => parseInt(x));
          const nv2 = v2.split('.').map((x) => parseInt(x));
          for (var i = 0; i < Math.min(nv1.length, nv2.length); i++) {
            if (nv1[i] === nv2[i]) continue;
            else return nv1[i] > nv2[i] ? v1 : v2;
          }
          return nv1.length > nv2.length ? v1 : v2;
        });
    });
  }
}

export default new CurrentOcVersion();
