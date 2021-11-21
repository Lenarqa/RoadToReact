import App, { Search, Button, Table } from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('App', ()=> {
  it('отрисовывает без ошибки', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
    
  test('Есть скриншот',() => {
    const component = renderer.create(
      <App />
    )
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});


describe('Search', ()=> {
  it('отрисовывает без ошибки', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
    
  test('Есть скриншот',() => {
    const component = renderer.create(
      <Search />
    )
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Button', ()=> {
  it('отрисовывает без ошибки', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
    
  test('Есть скриншот',() => {
    const component = renderer.create(
      <Button />
    )
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Table', ()=> {
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y'},
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }
    ],
  };
    
  it('отрисовывает без ошибки', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table { ...props } />, div);
  });

  it('в таблице 2 элемента', () => {
    const element = shallow(
      <Table { ...props } />
    );
    expect(element.find('.table-row').length).toBe(2);
  });

  test('есть корректный снимок', () => {
    const component = renderer.create(
      <Table { ...props } />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
