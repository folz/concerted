defmodule Concerted.PageController do
  use Concerted.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
