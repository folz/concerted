defmodule Concerted.RoomChannel do
  use Concerted.Web, :channel
  alias Concerted.Presence

  def join("rooms:lobby", _, socket) do
    send self(), :after_join
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{
      device: "browser",
      online_at: inspect(:os.timestamp())
    })
    push socket, "presence_state", Presence.list(socket)
    {:noreply, socket}
  end
end
