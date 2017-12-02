import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as movieActions from '../../actions/movieActions';
import MovieForm from "./MovieForm";
import toastr from 'toastr';

export class ManageMoviePage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      movie: Object.assign({}, props.movie),
      errors: {},
      saving: false
    };

    this.updateMovieState = this.updateMovieState.bind(this);
    this.saveMovie = this.saveMovie.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.movie.id !== nextProps.movie.id) {
      this.setState({movie: Object.assign({}, nextProps.movie)});
    }
  }

  updateMovieState(event) {
    const field = event.target.name;
    let movie = this.state.movie;
    movie[field] = event.target.value;
    return this.setState({movie: movie});
  }

  movieFormIsValid() {
    let formIsValid = true;
    let errors = {};

    if (this.state.movie.title.length < 5) {
      errors.title = 'Title should have at least 5 characters.';
      formIsValid = false;
    }

    this.setState({errors: errors});
    return formIsValid;
  }

  saveMovie(event) {
    event.preventDefault();

    if (!this.movieFormIsValid()){
      return;
    }

    this.setState({saving: true});
    this.props.actions.saveMovie(this.state.movie)
      .then(() => this.redirect())
      .catch(error => {
        toastr.error(error);
        this.setState({saving: false});
      });
  }

  redirect() {
    this.setState({saving: false});
    toastr.success('Movie saved');
    this.context.router.push('/movies');
  }

  render() {
    return (
      <div>
      <MovieForm
        movie={this.state.movie}
        onChange={this.updateMovieState}
        onSave={this.saveMovie}
        allAuthors={this.props.authors}
        saving={this.state.saving}
        errors={this.state.errors} />
      </div>
    );
  }
}

ManageMoviePage.propTypes = {
  movie: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  authors: PropTypes.array.isRequired
};

ManageMoviePage.contextTypes = {
  router: PropTypes.object
};

function getMovieById(movies, id) {
  const movie = movies.filter(movie => movie.id === id);
  if (movie) return movie[0];
  return null;
}

function mapStateToProps(state, ownProps) {
  const movieId = ownProps.params.id;

  let movie = {id: '', watchHref: '', title: '', authorId: '', length: '', category: ''};

  if (movieId && state.movies.length > 0) {
    movie = getMovieById(state.movies, movieId);
  }

  const authorsFormattedForDropdown = state.authors.map(author => {
      return {
        value: author.id,
        text: author.firstName + ' ' + author.lastName
      };
    });

  return {
      movie: movie,
      authors: authorsFormattedForDropdown
  };
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(movieActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageMoviePage);
