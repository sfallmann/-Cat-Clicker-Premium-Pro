(function () {


    // collection of cats

    var catCollection = [
        {
            name: "Butthole",
            image: "images/kitten.jpg",
            count: 0
        },
        {
            name: "Stoopid",
            image: "images/cat1.jpg",
            count: 0
        },
        {
            name: "Two-Jerks",
            image: "images/two-kittens.jpg",
            count: 0
        },
        {
            name: "Genius",
            image: "images/rolledup-cat.jpg",
            count: 0
        },
        {
            name: "Slim",
            image: "images/fat-cat.jpg",
            count: 0
        }
   ]

    var ListView = function(model){

        // set the model to the passed in cat
        this.model = model;
        // set a property 'el' to allow manipulation in the DOM
        this.el;

    }

    ListView.prototype = {

        // create the list element to render
        render: function () {
            this.el = $("<li/>", { "html": this.model.name, "class": "list-group-item" });

            $("#cat-list").append(this.el);
        },
    }

    var DetailView = function(model){

        // set the model to the passed in cat
        this.model = model;
        // set a property 'el' to allow manipulation in the DOM
        this.el;

    }

    DetailView.prototype = {

        // create the list element to render
        render: function () {

            this.el = $("<div/>", { "class": "panel panel-default" })
                    .append($("<div/>", {
                        "html": "Name: " + this.model.name,
                        "class": "bigger panel panel-heading"
                    }))
                    .append($("<img/>", {
                        "src": this.model.image,
                        "class": "img-responsive panel panel-body pic -clicker"
                    }))
                    .append($("<div />", {
                        "html": "Click Count: " + this.model.count,
                        "class": "bigger panel-footer -counter"
                    }));

            // unbind all the event handlers within #cat-display, empty it, and then add 'el' to it
            $("#cat-display").children().unbind();
            $("#cat-display").html(this.el);
        }

    }

    var AdminView = function(){

        // the admin panel starts closed
        this.open = false;
    }

    AdminView.prototype = {

        // create the admin panel
        render: function(){

            var nameInput =
                $("<input/>", {
                    "class": "form-control",
                    "type": "text",
                    "id": "-name-input",
                });

            var nameLabel =
                $("<label/>",{
                    "for": "-name-input",
                    "html": "Name: "
                });

            var imageInput =
                $("<input/>", {
                    "class": "form-control",
                    "type": "text",
                    "id": "-image-input"
                });

            var imageLabel =
                $("<label/>",{
                    "for": "-image-input",
                    "html": "Image: "
                });

            var clickInput =
                $("<input/>", {
                    "class": "form-control",
                    "type": "text",
                    "id": "-click-input"
                });

            var clickLabel =
                $("<label/>",{
                    "for": "-click-input",
                    "html": "Clicks: "
                });

            var cancelButton =
                $("<input/>", {
                    "class": "btn btn-danger",
                    "type": "button",
                    "id": "-cancel-edit",
                    "value": "Cancel"
                });

            var saveButton =
                $("<input/>", {
                    "class": "btn btn-success",
                    "type": "button",
                    "id": "-save-edit",
                    "value": "Save"
                });

            var buttonGroup =
                $("<div/>", {
                    "class": "btn-group"
                });

            buttonGroup.append(cancelButton).append(saveButton);


            $("#admin-edit")
                .append(nameLabel).append(nameInput).append(imageInput).append(clickInput).append(buttonGroup);

        }
    }

    // the 'octopus' - pass in all of cats as collection
    var Controller = function(collection){


        this.collection = collection;
        // set detailViews and listViews as empty arrays
        this.detailViews = [];
        this.listViews = [];
        // set selected to an empty object.  this will contain the listView, detailView, and model for the selected cat
        this.selected = {};
        this.adminView = new AdminView();
    }

    Controller.prototype = {

        // initialize the controller
        init: function(){

            //  set this to self for when this changes
            var self = this;

            // make sure adminOpen is false
            self.adminOpen = false;

            // loop through all of the cats
            for (var i=0; i < self.collection.length; i++){


                // create a new ListView for the cat at index[i] in collection
                var listView = new ListView(self.collection[i]);
                // create a new DetailView for the cat at index[i] in collection
                var detailView = new DetailView(self.collection[i]);
                // set model to the current cat for easy reference
                var model = self.collection[i];

                // add the cat's ListView to the controller's array of ListViews
                self.listViews.push(listView);
                // add the cat's DetailView to the controller's array of DetailViews
                self.detailViews.push(detailView);

                // rebder the list view for the current cat
                listView.render();

                // set the selection listener for this cat.
                self.setSelectListener(listView,detailView,model);

            }

            //  open the admin panel when the admin button is clicked
            $("#-admin-button").click(function(){

                // only open when it's closed
                if (!self.adminView.open){

                    // set model to the selected cat's model for easy reference
                    var model = self.selected.model;

                    // render the admin panel
                    self.adminView.render();
                    // it is now open so set the open variable to true
                    self.adminView.open = true;

                    // update the inputs in the admin panel with the selected model's values
                    self.updateAdminInputs(model);

                    // invoke the saveEdit function when the save button is clicked
                    $("#-save-edit").click(function(){
                        self.saveEdit();
                    });

                    // invoke the cancelEdit function when the cancel button is clicked
                    $("#-cancel-edit").click(function(){
                        self.cancelEdit();
                    });
                }
            });

            // trigger clicking the first cat in the list
            self.listViews[0].el.trigger("click");

        },
        // set the properties of the selected object to the ListView, DetailView, and model passed in
        setSelected: function(listView,detailView,model){
            this.selected = {
                listView: listView,
                detailView: detailView,
                model: model
            }
        },
        // set the click listener for the ListView 'el' property
        setSelectListener: function(listView,detailView,model){

            var self = this;


            listView.el.on("click", function(){
                // render the detailView
                detailView.render();
                // set selected since the selected cat change
                self.setSelected(listView,detailView,model);
                // update the admin panel values
                self.updateAdminInputs();
                // set the click listener for the newly rendered DetailView
                self.setClickListener();

            });
        },

        // set the listener for clicking the cat image
        setClickListener: function(){
            var self = this;
            // set selected to s for easy reference
            var s = self.selected;

            // get the clicker element -- the cat image -- in the DetailView
            var clicker = $(s.detailView.el).find(".-clicker");

            // get the counter element in the DetailView
            var counter = $(s.detailView.el).find(".-counter");

            // when the image is clicked
            $(clicker).on("click",function(){

                    // update the count of selected cat's model
                    s.model.count++;
                    // update the admin panel values
                    self.updateAdminInputs();
                    // update the counter in DetailView
                    $(counter).text("Click Count: " + s.model.count);

            });
        },

        // updates the admin input values
        updateAdminInputs: function(){
            // setting the model of selected for easy reference
            var model = this.selected.model;

            // if it's open, update the values
            if (this.adminView.open){
                $("#-name-input").val(model.name);
                $("#-image-input").val(model.image);
                $("#-click-input").val(model.count);
            }
        },
        // get rid of the admin panel when cancel is clicked - set open to false
        cancelEdit: function(){
            $("#admin-edit").children().unbind();
            $("#admin-edit").empty();
            this.adminView.open = false;
        },
        // method for saving the model's new values
        saveEdit: function(){
            // set s to selected for easy reference
            var s = this.selected;

            s.model.name = $("#-name-input").val();
            s.model.image = $("#-image-input").val();
            s.model.count = $("#-click-input").val();

            // render the DetailView of selected
            s.detailView.render();
            // change the value of the list item for the selected cat
            s.listView.el.text(s.model.name);
            // set the click event listener for the newly rendered DetailView
            this.setClickListener();
            // invoke cancelEdit() to get rid of the admin panel
            this.cancelEdit();

        }


    }

    var controller = new Controller(catCollection);
    controller.init();

}());
