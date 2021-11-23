import './App.css';
import { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const DEFAULT_HPP = '100';
const PARAM_HPP = 'hitsPerPage='


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStory = this.setSearchTopStory.bind(this);
    this.fetchSearchTopStory = this.fetchSearchTopStory.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStory(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStory(result.data))
      .catch(error => this.setState({ error }));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    
    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStory(searchTerm);
    }

    event.preventDefault();
  }

  setSearchTopStory(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    
    const oldHits = results && results[searchKey] 
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({ 
      results: {
        ...results, 
        [searchKey]: { hits: updatedHits, page },
      },
      isLoading: false
    });
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStory(searchTerm);
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const updateList = hits.filter(item => item.objectID !== id);
    
    this.setState({
      results: {
        ...results, 
        [searchKey]: { hits: updateList, page }
      }
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { 
      searchTerm, 
      results, 
      searchKey,
      error,
      isLoading
    } = this.state;
    
    const page = (
      results && 
      results[searchKey] && 
      results[searchKey].page
    ) || 0;

    const list  = (
      results && 
      results[searchKey] && 
      results[searchKey].hits
    ) || [];

    if (!results) { return null; };

    return (
      <div className="page">
        <div className="interactions">
          {/* <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >Поиск</Search> */}
          {
            <SearchClassComponent
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}  
            >
              Search
            </SearchClassComponent>
          }
        </div>
        <InfoRow />
        {
          error  
          ? <div className="interactions">
              <h2>Something go wrong!</h2>
              <p>{error}</p>
            </div>
          : <Table 
              list={list}
              onDismiss={this.onDismiss}
            />
        }
        
        <div className="interactions">
          {
              isLoading 
              ? <Loading />
              : <Button onClick={() => this.fetchSearchTopStory(searchKey, page + 1)}>
                  More history
                </Button>
          }
          
        </div>
        
        
      </div>
    );
  }
}

const Search  = ({ value, onChange, children, onSubmit }) => 
  <form onSubmit={onSubmit}>
      <input 
        type="text"
        value={value}
        onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
  </form>

Search.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired
}

class SearchClassComponent extends Component {
  componentDidMount () {
    if(this.input) {
      this.input.focus();
    }
  }

  render () {
    const { 
      value,
      onChange,
      children,
      onSubmit 
    } = this.props; 
    return (
      <form onSubmit={onSubmit}>
        <input 
          type="text"
          value={value}
          onChange={onChange}
          ref = {node => { this.input = node; }}
        />
        <button type="submit">
          {children}
        </button>
      </form>
    )
  }
} 

const Table = ({ list, onDismiss }) => 
      <div className="table"> 
        {list.map(item => 
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%' }}>
                <a href={item.url} target="_blank">{item.title}</a>
              </span>
              <span style={{ width: '30%' }}>{item.author}</span>
              <span style={{ width: '10%' }}>{item.num_comments}</span>
              <span style={{ width: '10%' }}>{item.points}</span>
              <span style={{ width: '10%' }}>
                <Button 
                  onClick={() => onDismiss(item.objectID)}
                  className="button-inline"
                  type="button"
                >
                  Delete
                </Button>
              </span>
            </div>
          )}
      </div>

Table.propTypes = {
  list: PropTypes.array.isRequired,
  onDismiss: PropTypes.func.isRequired
}

const Button = ({ onClick, className="", children}) => 
      <button 
        onClick={onClick}
        className={className}
        type="button"
      >
        {children}
      </button>

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

const InfoRow = () => 
  <div className="table-row">
    <span style={{ width: '40%' }}>
      <h3>Title</h3>
    </span>
    <span style={{ width: '30%' }}><h3>Author</h3></span>
    <span style={{ width: '10%' }}><h3>Comments</h3></span>
    <span style={{ width: '10%' }}><h3>Points</h3></span>
    <span style={{ width: '10%' }}>
      <h3>Action</h3>
    </span>
  </div>

const Loading = () => <div> Loading... </div>

export default App;

export {
  Button,
  Search,
  Table
};