import './App.css';
import { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { sortBy } from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const DEFAULT_HPP = '100';
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};
  

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
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
          {/* {
              isLoading 
              ? <Loading />
              : <Button onClick={() => this.fetchSearchTopStory(searchKey, page + 1)}>
                  More history
                </Button>
          } */}
          <ButtonWithLoading 
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStory(searchKey, page + 1)}
          >
            More history
          </ButtonWithLoading>  
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

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }


  render() {
    const { list, onDismiss } = this.props;
    const { sortKey, isSortReverse } = this.state;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;
  
    return (
      <div className="table"> 
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort sortKey={'TITLE'} onSort={this.onSort} activeSortKey={sortKey}>Title</Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort sortKey={'AUTHOR'} onSort={this.onSort} activeSortKey={sortKey}>Author</Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort sortKey={'COMMENTS'} onSort={this.onSort} activeSortKey={sortKey}>Comments</Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort sortKey={'POINTS'} onSort={this.onSort} activeSortKey={sortKey}>Points</Sort>
          </span>
          <span style={{ width: '10%' }}>
            Action
          </span>
        </div>
        {reverseSortedList.map(item => 
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
    )
  }
} 



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

const Loading = () => 
  <div>
    <FontAwesomeIcon icon={faSpinner} /> Loading...
  </div>  

// HOC example
const withFoo = (Component) => {
  return (props) => {
    return <Component {...props} />
  }
}

const withLoading = Component => ({ isLoading, ...rest}) => 
  isLoading 
    ? <Loading />
    : <Component {...rest} />

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, activeSortKey, children}) => {
  // const sortClass = ['button-inline'];
  // if(sortKey == activeSortKey) {
  //   sortClass.push('button-active')
  // }
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey } 
  )

  return (
    // <Button className={sortClass.join(' ')} onClick={() => onSort(sortKey)}>{children}</Button> //without className
    <Button className={sortClass} onClick={() => onSort(sortKey)}>{children}</Button>
  )
}

export default App;

export {
  Button,
  Search,
  Table
};