const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
      <img style="width:50px;" src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
      `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchMovies(search) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "78d90c09",
        s: search,
      },
    });
    if (response.data.Error) {
      return [];
    }
    // console.log(response.data);
    return response.data.Search;
  },
};

createAutoComplete({
  root: document.querySelector("#left-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
createAutoComplete({
  root: document.querySelector("#right-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(
      onMovieSelect(movie, document.querySelector("#right-summary"), "right")
    );
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "78d90c09",
      i: movie.imdbID,
    },
  });
  // console.log(response.data);
  summaryElement.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  console.log(`time for comparison!`);
  const leftSide = document.querySelectorAll("#left-summary .notification");
  const rightSide = document.querySelectorAll("#right-summary .notification");
  leftSide.forEach((leftStatus, index) => {
    const rightStatus = rightSide[index];
    console.log(leftStatus, rightStatus);
    const leftSideValue = leftStatus.dataset.value;
    const rightSideValue = rightStatus.dataset.value;
    console.log(leftSideValue, rightSideValue);
    if (rightSideValue > leftSideValue) {
      leftStatus.classList.remove("is-primary");
      leftStatus.classList.add("is-danger");
    } else {
      rightStatus.classList.remove("is-primary");
      rightStatus.classList.add("is-danger");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbrating = parseFloat(movieDetail.imdbRating);
  const imdbvotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);
  console.log(awards);

  return `
  <article class="media">
<figure class="media-left">
<p class="image">
<img src="${movieDetail.Poster}" />
</p>
</figure>
<div class="media-content">
<div class="content">
<h1>${movieDetail.Title}</h1>
<h4>${movieDetail.Genre}</h4>
<p>${movieDetail.Plot}</p>
</div>
</div>
  </article>
  <article data-value=${awards} class="notification is-primary">
  <p class="title">
  ${movieDetail.Awards}
  </p>
  <p class="title">Awards</p>
  </article>
  <article data-value=${dollars} class="notification is-primary">
  <p class="title">
  ${movieDetail.BoxOffice}
  </p>
  <p class="title">Box Office</p>
  </article>
  <article data-value=${metascore} class="notification is-primary">
  <p class="title">
  ${movieDetail.Metascore}
  </p>
  <p class="title">Metascore</p>
  </article>
  <article data-value=${imdbrating} class="notification is-primary">
  <p class="title">
  ${movieDetail.imdbRating}
  </p>
  <p class="title">IMDB Rating</p>
  </article>
  <article data-value=${imdbvotes} class="notification is-primary">
  <p class="title">
  ${movieDetail.imdbVotes}
  </p>
  <p class="title">IMDB Votes</p>
  </article>
  `;
};
