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
    .then(() => (loading = false));

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
  <h2 class="ui header">Nouvelle commande</h2>
  <table class="ui celled selectable table">
    <tbody>
      {#each filteredProducts as product}
        <tr on:click={() => selectProduct(product)}>
          <td>
            <img
              src={'/images/' + product.image}
              alt=""
              class="ui mini image" />
          </td>
          <td>{product.nom}</td>
          <td>{product.prixUnitaire.toFixed(2)} €</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="ui input fluid icon">
    <input type="text" bind:value={searchInput} />
    <i class="search icon" />
  </div>
  <ul>
    {#each commande as product, i}
      <li>
        {product.nom} ({product.prixUnitaire.toFixed(2)} €) <i
          class="delete icon"
          on:click={() => removeProduct(i)} />
      </li>
    {/each}
  </ul>
  <div class="ui one tiny horizontal statistics">
    <div class="statistic">
      <div class="value">{total.toFixed(2)} €</div>
      <div class="label">total</div>
    </div>
  </div>
  <button class="ui button fluid" on:click={postCommand}>Valider</button>
</main>
