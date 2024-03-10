class Categories extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        categories: [],
        selectedCategories: [],
        searchResults: [],
        filter: "",
        query: "",
        showError: false,
      };
    }

    componentDidMount() {
      this.fetchCategories();
    }

    fetchCategories() {
      fetch("https://www.includecore.com/api/projects/4867/databases/7367-Categories?order=oldest")
        .then((response) => response.json())
        .then((parsedResponse) =>
          this.setState(
            {
              categories: parsedResponse.data,
              selectedCategories: parsedResponse.data,
            },
            () => this.searchMeals()
          )
        )
        .catch((error) =>
          console.error("Error fetching categories:", error)
        );
    }

    searchMeals = () => {
      const { selectedCategories, query } = this.state;

      if (selectedCategories.length === 0) {
        this.setState({ showError: true, searchResults: [] });
        return;
      } else {
        this.setState({ showError: false });
      }

      const filter = JSON.stringify([
        {
          field: "category",
          operator: "in",
          value: selectedCategories.map((category) => category.id),
        },
      ]);
      fetch(
        `https://www.includecore.com/api/projects/4867/databases/7368-Meals?q=${query}&filter=${filter}`
      )
        .then((response) => response.json())
        .then((parsedResponse) =>
          this.setState({ searchResults: parsedResponse.data, filter })
        )
        .catch((error) => console.error("Error fetching meals:", error));
    };

    handleInputChange = (event) => {
      const query = event.target.value;
      this.setState({ query }, () => this.searchMeals());
    };

    toggleCategorySelection = (category) => {
      const { selectedCategories } = this.state;
      const index = selectedCategories.indexOf(category);
      if (index === -1) {
        this.setState(
          { selectedCategories: [...selectedCategories, category] },
          () => {
            this.searchMeals();
          }
        );
      } else {
        this.setState(
          {
            selectedCategories: selectedCategories.filter(
              (cat) => cat !== category
            ),
          },
          () => {
            this.searchMeals();
          }
        );
      }
    };

    clearInput = () => {
        this.setState({query: ''}, () => this.searchMeals());
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    };

    render() {
      const { categories, selectedCategories, searchResults, showError, query } = this.state;
      return (
        <div className="container">
          <h1>Italian Meals Finder 🍕🍝🇮🇹</h1>
          <div className="search-input-container">
            <input
              ref={(input) => (this.searchInput = input)}
              className="search-input"
              type="text"
              placeholder="Search our yummy database of Italian foods!"
              onInput={this.handleInputChange}
            />
            <button className="reset-input" onClick={this.clearInput}>
              &#215;
            </button>
          </div>
          <ul className="categories-list">
            {categories.map((category) => (
              <li key={category.id}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => this.toggleCategorySelection(category)}
                  />
                  {category.name}
                </label>
              </li>
            ))}
          </ul>
          <hr />
          {showError && (
            <p className="error-message">Please select at least one category!</p>
          )}
          <div className={!showError ? "" : "hide"}>
            {searchResults.length > 0 && (
              <div>
                <h4>{query.trim() === "" ? "Recently added dishes" : "Search Results"}</h4>
                {query.trim() === "" ? (
                  <ul>
                    {searchResults
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((result) => (
                        <li key={result.id}>{result.name}</li>
                      ))}
                  </ul>
                ) : (
                  <ul>
                    {searchResults.map((result) => (
                      <li key={result.id}>{result.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {searchResults.length === 0 && (
              <p className="no-results-message">{query.trim() === "" ? "" : "No results found."}</p>
            )}
          </div>
        </div>
      );
    }
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Categories />);