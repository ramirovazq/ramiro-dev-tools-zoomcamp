Title: GitHub - alexeygrigorev/minsearch: Minimalistic text search engine that uses sklearn and pandas

URL Source: https://github.com/alexeygrigorev/minsearch

Markdown Content:
minsearch
---------

[](https://github.com/alexeygrigorev/minsearch#minsearch)
A minimalistic search engine that provides both text-based and vector-based search capabilities. The library provides three implementations:

1.   `Index`: A basic search index using scikit-learn's TF-IDF vectorizer for text fields
2.   `AppendableIndex`: An appendable search index using an inverted index implementation that allows for incremental document addition
3.   `VectorSearch`: A vector search index using cosine similarity for pre-computed vectors

Features
--------

[](https://github.com/alexeygrigorev/minsearch#features)
*   Text field indexing with TF-IDF and cosine similarity
*   Vector search with cosine similarity for pre-computed embeddings
*   Keyword field filtering with exact matching
*   Field boosting for fine-tuning search relevance (text-based search)
*   Stop word removal and custom tokenization
*   Support for incremental document addition (AppendableIndex and VectorSearch)
*   Customizable tokenizer patterns and stop words
*   Efficient search with filtering and boosting

Installation
------------

[](https://github.com/alexeygrigorev/minsearch#installation)

pip install minsearch

Environment setup
-----------------

[](https://github.com/alexeygrigorev/minsearch#environment-setup)
For development purposes, use uv:

# Install uv if you haven't already
pip install uv
uv sync --extra dev

Usage
-----

[](https://github.com/alexeygrigorev/minsearch#usage)
### Basic Search with Index

[](https://github.com/alexeygrigorev/minsearch#basic-search-with-index)

from minsearch import Index

# Create documents
docs = [
    {
        "question": "How do I join the course after it has started?",
        "text": "You can join the course at any time. We have recordings available.",
        "section": "General Information",
        "course": "data-engineering-zoomcamp"
    },
    {
        "question": "What are the prerequisites for the course?",
        "text": "You need to have basic knowledge of programming.",
        "section": "Course Requirements",
        "course": "data-engineering-zoomcamp"
    }
]

# Create and fit the index
index = Index(
    text_fields=["question", "text", "section"],
    keyword_fields=["course"]
)
index.fit(docs)

# Search with filters and boosts
query = "Can I join the course if it has already started?"
filter_dict = {"course": "data-engineering-zoomcamp"}
boost_dict = {"question": 3, "text": 1, "section": 1}

results = index.search(query, filter_dict=filter_dict, boost_dict=boost_dict)

### Incremental Search with AppendableIndex

[](https://github.com/alexeygrigorev/minsearch#incremental-search-with-appendableindex)

from minsearch import AppendableIndex

# Create the index
index = AppendableIndex(
    text_fields=["title", "description"],
    keyword_fields=["course"]
)

# Add documents one by one
doc1 = {"title": "Python Programming", "description": "Learn Python programming", "course": "CS101"}
index.append(doc1)

doc2 = {"title": "Data Science", "description": "Python for data science", "course": "CS102"}
index.append(doc2)

# Search with custom stop words
index = AppendableIndex(
    text_fields=["title", "description"],
    keyword_fields=["course"],
    stop_words={"the", "a", "an"}  # Custom stop words
)

### Vector Search with VectorSearch

[](https://github.com/alexeygrigorev/minsearch#vector-search-with-vectorsearch)

from minsearch import VectorSearch
import numpy as np

# Create sample vectors and payload documents
vectors = np.random.rand(100, 768)  # 100 documents, 768-dimensional vectors
payload = [
    {"id": 1, "title": "Python Tutorial", "category": "programming", "level": "beginner"},
    {"id": 2, "title": "Data Science Guide", "category": "data", "level": "intermediate"},
    {"id": 3, "title": "Machine Learning Basics", "category": "ai", "level": "advanced"},
    # ... more documents
]

# Create and fit the vector search index
index = VectorSearch(keyword_fields=["category", "level"])
index.fit(vectors, payload)

# Search with a query vector
query_vector = np.random.rand(768)  # 768-dimensional query vector
filter_dict = {"category": "programming", "level": "beginner"}

results = index.search(query_vector, filter_dict=filter_dict, num_results=5)

#### Incremental Vector Search

[](https://github.com/alexeygrigorev/minsearch#incremental-vector-search)
VectorSearch now supports appending vectors incrementally:

from minsearch import VectorSearch
import numpy as np

# Create the index
index = VectorSearch(keyword_fields=["category", "level"])

# Append a single vector
vector = np.random.rand(768)
doc = {"id": 1, "title": "Python Tutorial", "category": "programming", "level": "beginner"}
index.append(vector, doc)

# Append multiple vectors in batch
vectors = np.random.rand(10, 768)
payload = [
    {"id": i+2, "title": f"Document {i+2}", "category": "data", "level": "intermediate"}
    for i in range(10)
]
index.append_batch(vectors, payload)

# Search works the same way
query_vector = np.random.rand(768)
results = index.search(query_vector, num_results=5)

### Advanced Features

[](https://github.com/alexeygrigorev/minsearch#advanced-features)
#### Custom Tokenizer Pattern

[](https://github.com/alexeygrigorev/minsearch#custom-tokenizer-pattern)

from minsearch import AppendableIndex

# Create index with custom tokenizer pattern
index = AppendableIndex(
    text_fields=["title", "description"],
    keyword_fields=["course"],
    tokenizer_pattern=r'[\s\W\d]+'  # Custom pattern to split on whitespace, non-word chars, and digits
)

#### Field Boosting (Text-based Search)

[](https://github.com/alexeygrigorev/minsearch#field-boosting-text-based-search)

# Boost certain fields to increase their importance in search
boost_dict = {
    "title": 2.0,      # Title matches are twice as important
    "description": 1.0  # Normal importance for description
}
results = index.search("python", boost_dict=boost_dict)

#### Keyword Filtering

[](https://github.com/alexeygrigorev/minsearch#keyword-filtering)

# Filter results by exact keyword matches
filter_dict = {
    "course": "CS101",
    "level": "beginner"
}
results = index.search("python", filter_dict=filter_dict)

Examples
--------

[](https://github.com/alexeygrigorev/minsearch#examples)
### Interactive Notebook

[](https://github.com/alexeygrigorev/minsearch#interactive-notebook)
The repository includes an interactive Jupyter notebook (`minsearch_example.ipynb`) that demonstrates the library's features using real-world data. The notebook shows:

*   Loading and preparing documents from a JSON source
*   Creating and configuring the search index
*   Performing searches with filters and boosts
*   Working with real course-related Q&A data

To run the notebook:

uv run jupyter notebook

Then open `minsearch_example.ipynb` in your browser.

Development
-----------

[](https://github.com/alexeygrigorev/minsearch#development)
### Running Tests

[](https://github.com/alexeygrigorev/minsearch#running-tests)

uv run pytest

### Building and Publishing

[](https://github.com/alexeygrigorev/minsearch#building-and-publishing)
1.   Install development dependencies:

uv sync --extra dev

1.   Build the package:

uv run hatch build

1.   Publish to test PyPI:

uv run hatch publish --repo test

1.   Publish to PyPI:

uv run hatch publish

1.   Clean up:

rm -r dist/

Or run

python publish.py

Note: For Hatch publishing, you'll need to configure your PyPI credentials in `~/.pypirc` or use environment variables.

PyPI Credentials Setup
----------------------

[](https://github.com/alexeygrigorev/minsearch#pypi-credentials-setup)
Create a `.pypirc` file in your home directory with your PyPI credentials:

[distutils]
index-servers =
    pypi
    testpypi

[pypi]
repository = https://upload.pypi.org/legacy/
username = __token__
password = pypi-your-main-api-token-here

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-your-test-api-token-here

**Important Notes:**

*   Use `__token__` as the username for API tokens
*   Get your tokens from [PyPI](https://pypi.org/manage/account/token/) and [Test PyPI](https://test.pypi.org/manage/account/token/)
*   Set file permissions: `chmod 600 ~/.pypirc`

**Alternative: Environment Variables**

export HATCH_INDEX_USER=__token__
export HATCH_INDEX_AUTH=your-pypi-token

Project Structure
-----------------

[](https://github.com/alexeygrigorev/minsearch#project-structure)
*   `minsearch/`: Main package directory 
    *   `minsearch.py`: Core Index implementation using scikit-learn
    *   `append.py`: AppendableIndex implementation with inverted index
    *   `vector.py`: VectorSearch implementation using cosine similarity

*   `tests/`: Test suite
*   `minsearch_example.ipynb`: Example notebook
*   `setup.py`: Package configuration
*   `Pipfile`: Development dependencies

Note: The `minsearch.py` file in the root directory is maintained for backward compatibility with the LLM Zoomcamp course.
