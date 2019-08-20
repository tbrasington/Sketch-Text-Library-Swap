import sketch from 'sketch'
import fuzzysort from 'fuzzysort'
// documentation: https://developer.sketchapp.com/reference/api/




let document = sketch.getSelectedDocument();

let textLayers = [];

function doSomething(object) {
  // do something with the object
  // you can know what type of object you have using object.type. That would be "Artboard" or "Group" or whatever
  if (object.type === "Text") {
    textLayers.push(object)
  }
  if (object.layers && object.layers.length) {
    // iterate through the children
    object.layers.forEach(doSomething)
  }
}

// start the recursion
document.selectedPage.layers.forEach(doSomething);

export default function () {
  sketch.UI.message("It's alive 🙌")
  let userLibraries = sketch.getLibraries()

  //  // console.log(userLibraries);
  let LibraryNames = userLibraries.map(item => { return item.name });
  sketch.UI.getInputFromUser("Choose library to import from", {
    type: sketch.UI.INPUT_TYPE.selection,
    possibleValues: LibraryNames
  }, (err, value) => {
    if (err) {
      // most likely the user canceled the input
      return
    } else {
      let SelectedLibrary = userLibraries.filter(item => item.name === value);
      findNewStyle(SelectedLibrary[0])
    }
  });

 


  function findNewStyle(library) {

    let libraryStyles = library.getImportableTextStyleReferencesForDocument(document);
 
    // go through text layers
    textLayers.forEach(layer => {
      // console.log(layer.name)
      let stylename = document.getSharedTextStyleWithID(layer.sharedStyleId).name;
     // console.log('checking for ' + stylename + ' on layer ' + layer.name)
      const results = fuzzysort.go(stylename, libraryStyles.map(item => item.name))
      results.forEach(result => {
        if (result.score >= -20) {
          let newStyle = libraryStyles.filter(item => item.name === result.target);
          let importNewStyle = newStyle[0].import()
         // console.log(newStyle)
          layer.sharedStyleId = importNewStyle.id
          layer.style = importNewStyle.style
        }
      })
    })
  }
}




  // let libraryStyles;
  // userLibraries.forEach(library=> {
  //   if(library.name==='mrp-textstyles-cn-swap') {
  //       libraryStyles = library.getImportableTextStyleReferencesForDocument(
  //       document
  //     ); 
  //   }
  // })
