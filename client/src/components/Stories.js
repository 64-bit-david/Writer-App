import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import displayError from './displayError';

import { fetchStories, clearError, clearMessage } from '../actions/index';
import Snippets from './Snippets';
import paginationHelper from './paginationHelper';


const Stories = ({ stories, fetchStories, pager, match, clearMessage, error, message, clearError }) => {



  const [currentPage, setCurrentPage] = useState(match.params.page);



  useEffect(() => {
    setCurrentPage(match.params.page);
  }, [setCurrentPage, match.params.page])

  useEffect(() => {
    if (pager.currentPage !== currentPage && currentPage) {
      fetchStories(currentPage);
    }
    else {
      fetchStories(1)
    }
  }, [fetchStories, pager.currentPage, currentPage]);


  useEffect(() => {
    return function cleanup() {
      clearError();
    }
  }, [clearError])

  useEffect(() => {
    return function cleanup() {
      clearMessage()
    }
  }, [clearMessage])


  //creates a new array with a few extras inserted at the start of the stories array
  const storiesArrayWithFeed = () => {
    const emptyObj = {};
    const copyStories = [...stories];
    copyStories.splice(0, 0, emptyObj);
    copyStories.splice(1, 0, emptyObj);
    copyStories.splice(2, 0, emptyObj);
    return copyStories
  }

  //renders the array of user stories into grid items, insert a featured story at the index 0, snippets component at index 1 and a title for latest stories at index 2
  const renderGrid = () => {
    const storiesWithFeed = storiesArrayWithFeed();
    return storiesWithFeed.map((story, index) => {
      if (index === 0) {
        return (
          <div className={`story-item-container`} key={index}>
            <Link
              to={`/story/606ae0b59dbfba3cccf41568`}
            >
              <div className="story-item featured-story">
                <h5 className="featured-text">Featured Story</h5>
                <h3>Shall I compare thee to a summer's day?</h3>
                <p className="story-page-author">Posted by: Somebody</p>
                <p className="story-page-desc">
                  A poem I wrote back in February about better days to come! Kinda sombre in theme as well but don't let it get you down too much!
                  A poem I wrote back in February about better days to come! Kinda sombre in theme as well but don't
              </p>
              </div>
            </Link>
          </div>
        )
      }
      if (index === 1) {
        return (
          <div className={`story-item-container snippets-container`} key={index}>
            <Snippets />
          </div>
        )
      }
      if (index === 2) {
        return (
          <div className="story-item-container sub-header-container" key={index}>
            <h2>Latest Stories</h2>
          </div>
        )
      }
      return (
        <div className={`story-item-container`} key={index}>
          <Link
            to={`/story/${story._id}`}
          >
            <div className="story-item">
              <h3>{story.title}</h3>
              <p className="story-page-author">Posted by: {story.username}</p>
              <p className="story-page-desc">
                {story.description}
              </p>
            </div>
          </Link>

        </div >
      )
    })

  }

  const pageSuccess = () => {
    return (
      <div className="stories-container">
        <div className="header-container">
          <h1>Home</h1>
        </div>
        <p className="p-welcome">Welcome to <span>Writer's Desk</span>, a space for creative writers to share their work! Sign up and post your own stories and consider supporting other writers with a donation.</p>
        <div className="stories-grid author-stories-grid">
          {renderGrid()}
        </div>
        {paginationHelper(pager, currentPage, '/stories/')}
      </div>
    )
  }

  const renderMessages = () => {
    if (message) {
      return (
        <div className="message-container">
          <div className="message">
            <p>{message}</p>
            <button
              className="btn notification-btn"
              onClick={() => clearMessage()}>Close</button>
          </div>
        </div>
      )
    }
  }

  return (
    <div>
      {renderMessages()}
      {error ? displayError(error, clearError) : pageSuccess()}

    </div>
  )
}


const mapStateToProps = ({ stories, pager, error, message }) => {
  return { stories, pager, error, message }
}

export default connect(mapStateToProps, { fetchStories, clearError, clearMessage })(Stories);
