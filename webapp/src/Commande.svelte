<script>
  const ProductsLimit = 5;
  let searchInput = "";
  let products = [];
  let commande = [];
  let loading = true;
  $: filteredProducts = search(searchInput, products).slice(0, ProductsLimit);
  $: total = commande.reduce((total, item) => total + item.prixUnitaire, 0);

  // Get products
  fetch("/produits?format=json")
    .then((res) => res.json())
    .then((data) => (products = data))
    .then(() => {
      loading = false;
      document.getElementById("waiting").remove();
    });

  function search(word, products) {
    word = word.toLowerCase();
    const result = [];
    products.forEach((product) => {
      if (product.nom.toLowerCase().includes(word)) result.push(product);
      else if (
        word.split(" ").every((part) => {
          return product.nom.toLowerCase().includes(part);
        })
      )
        result.push(product);
    });
    return result;
  }

  function selectProduct(product) {
    commande = [...commande, { ...product }];
  }

  function removeProduct(index) {
    commande = commande.filter((item, i) => i !== index);
  }

  function postCommand() {
    const clientId = window.location.pathname.split("/").pop();
    fetch("/clients/" + clientId + "/commande", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commande.map((item) => item._id)),
    }).then(() => window.location.reload());
  }
</script>

<main>
  <div class="ui inverted dimmer" class:active={loading}>
    <div class="ui loader" />
  </div>
  <div class="ui grid">
    <div class="ui two column row">
      <div class="column">
        <div class="ui input fluid icon">
          <input type="text" bind:value={searchInput} />
          <i class="search icon" />
        </div>
        <table class="ui celled selectable table">
          <tbody>
            {#each filteredProducts as product}
              <tr on:click={() => selectProduct(product)}>
                <td>
                  <img
                    src={'/images/' + product.image}
                    alt=""
                    class="ui avatar image" />
                </td>
                <td>{product.nom}</td>
                <td>{product.prixUnitaire.toFixed(2)} €</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="column">
        <div class="ui tiny statistic">
          <div class="value">{total.toFixed(2)} €</div>
          <div class="label">total</div>
        </div>
        <button
          class="ui button positive right floated"
          on:click={postCommand}>Valider</button>
        <div class="ui animated divided list">
          {#each commande as product, i}
            <div class="item">
              <div class="right floated content">
                <div
                  class="ui icon button negative"
                  on:click={() => removeProduct(i)}>
                  <i class="delete icon" />
                </div>
              </div>
              <div class="content">
                <span class="header">{product.nom}</span>
                <div class="description">
                  {product.prixUnitaire.toFixed(2)}
                  €
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
