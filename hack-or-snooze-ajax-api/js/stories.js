"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${starHTML(story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// star HTML
function starHTML(story){
  if (currentUser.isFavorite(story)) { // generate gold color button
    return `<button class="favorite-button gold">&#9733</button>`
  }
  else {
    return `<button class="favorite-button">&#9733</button>`
  }
}

// delete HTML
function deleteHTML(){
  
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// show favorites list
function putFavoritesOnPage(){
  console.debug("putFavoritesOnPage");
  $favoritesList.empty();
  if (!(currentUser.favorites.length === 0)){
    for (let favorite of currentUser.favorites){
      let $favorite = generateStoryMarkup(favorite);
      $favoritesList.append($favorite);
    }
  }
  else {
    $favoritesList.append($(`<div>No favorites added!</div>`));
  }
  $favoritesList.show();
}

function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");
}
// submit new story
async function submitNewStory(evt){
  console.debug("submitNewStory");
  evt.preventDefault();
  // submit form values
  let $titleValue = $("#new-title").val();
  let $authorValue = $("#new-author").val();
  let $urlValue = $("#new-url").val();
  const newStory = await storyList.addStory(currentUser, {
    title: $titleValue, 
    author: $authorValue, 
    url: $urlValue
    });
  $allStoriesList.prepend(generateStoryMarkup(newStory));
  putStoriesOnPage();
  $submitForm.hide().trigger("reset");;
}

$submitForm.on("submit", submitNewStory);

// toggle favorite button HTML and add/remove favorite story
async function toggleFavoriteStory(evt) {
  console.debug("toggleFavoriteStory");
  let $e = $(evt.target); // button
  let $storyId = $e.closest("li").attr("id"); // story id based on list item
  let story = storyList.stories.find(story => story.storyId === $storyId) // find the actual story from storyList
  if (currentUser.isFavorite(story)) { // favorited -> unfavorited, need to remove
    await currentUser.addOrRemoveFavoriteStory("remove", story);
  }
  else { // unfavorited -> favorited, need to add
    await currentUser.addOrRemoveFavoriteStory("add", story);
  }
  $e.toggleClass("gold"); // toggle button css
  //location.reload();
}

$allStoriesList.on("click", $(".favorite-button"), toggleFavoriteStory);
$favoritesList.on("click", $(".favorite-button"), toggleFavoriteStory);


