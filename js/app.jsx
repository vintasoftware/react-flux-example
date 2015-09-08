import Alt from 'alt'
import connectToStores from 'alt/utils/connectToStores'
var alt = new Alt()

import React from 'react'


class BikeActions {
  // Action to filter bikes by name
  filterBikes(name) {
    this.dispatch(name)  // dispatch 'name' payload
                         // could also be `return name`, because Alt
                         // will automatically dispatch returned values
  }
}

BikeActions = alt.createActions(BikeActions)

class BikeStore {
  constructor() {
    // Registers at the Dispatcher
    // the `onFilterBikes` Store method
    // to be the handler of `BikeActions.filterBikes`
    this.bindListeners({
      onFilterBikes: BikeActions.filterBikes
    })

    // Initial state of this Store.
    // On a server facing webapp we would get this
    // via a request to the server [TODO: see chapter ??]
    var bikes = [
      {
        key: 1,
        name: "Caloi"
      },
      {
        key: 2,
        name: "Monark"
      },
      {
        key: 3,
        name: "Hipster Fixed Gear"
      }
    ]
    
    this.state = {
      bikes: bikes,
      filteredBikes: bikes
    }
  }

  // Method that handles `BikeActions.filterBikes` Action.
  // Receives that Action payload of data as a parameter
  // and with it changes the internal state of this Store
  onFilterBikes(name) {
    if (name) {
      this.state.filteredBikes = 
        this.state.bikes.filter(b =>
          b.name.toLowerCase().includes(name.toLowerCase()))
    } else {
      this.state.filteredBikes = this.state.bikes
    }
  }
}

BikeStore = alt.createStore(BikeStore, 'BikeStore')

// Component to display a single bike info
class Bike extends React.Component {
  render() {
    return (
      <li>
        {this.props.name}
      </li>
    )
  }
}

// Component to display an input for filtering bikes by name
class BikeFilterInput extends React.Component {
  render() {
    return (
      <input onChange={this.props.onChange}
             placeholder="Filter bikes by name..." />
    )
  }
}

@connectToStores  // this decorator is necessary
                  // to tell this Component listens to Stores
class BikeList extends React.Component {
  // Method that tells which Stores this Component
  // listens to updated events and also gets data from
  static getStores() {
    return [BikeStore];
  }

  // Method that makes this Component props
  // to be get from BikeStore current state
  // (will be called at each BikeStore update)
  static getPropsFromStores() {
    return BikeStore.getState();
  }

  // Creator of BikeActions.filterBikes action,
  // which is called every time BikeFilterInput changes
  _onChangeFilterInput(event) {
    return BikeActions.filterBikes(event.target.value);
  }

  render() {
    return (
      <ul>
        <BikeFilterInput onChange={this._onChangeFilterInput} />
        {this.props.filteredBikes.map(bike => {  // for each filteredBikes bike
          return ( 
            <Bike key={bike.key}  // a unique key is necessary for
                                  // all React dynamic children components
                  name={bike.name} />
          )
        })}
      </ul>
    )
  }
}

React.render(
  <BikeList />,
  document.getElementById('content')
)
