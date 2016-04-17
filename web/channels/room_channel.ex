defmodule Concerted.RoomChannel do
  use Concerted.Web, :channel
  alias Concerted.Presence

  @hypes [[26, 62], [80, 115], [137, 155]]
  @timings [[43, 62], [97, 115], [137, 155]]

  def join("rooms:lobby", _, socket) do
    send self(), :ping
    send self(), :timings
    send self(), :after_join
    send self(), :collective?
    {:ok, socket}
  end

  def handle_info(:ping, socket) do
    push socket, "ping", %{ping: inspect(:os.system_time(:seconds))}
    {:noreply, socket}
  end

  def handle_info(:timings, socket) do
    push socket, "timings", %{hypes: @hypes, timings: @timings}
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.client_id, %{
      ingroup: false
    })
    push socket, "presence_state", Presence.list(socket)
    {:noreply, socket}
  end

  def handle_info(:collective?, socket) do
    {ingroupers, total} = Enum.reduce(
      Concerted.Presence.list("rooms:lobby"),
      {0, 0},
      fn {key, %{metas: values}}, {in_acc, total_acc} ->
        {Enum.reduce(values, 0, fn e, acc ->
          if e.ingroup do 1 else 0 end + in_acc end),
         1 + total_acc}
      end)
    broadcast! socket, "concerted", %{ingroupers: ingroupers, total: total}
    {:noreply, socket}
  end

  def handle_in("pong", data, socket) do
    {:noreply, socket}
  end

  def handle_in("start", _data, socket) do
    broadcast! socket, "start", %{}
    {:noreply, socket}
  end

  def handle_in("effort", %{"ingroup" => ingroup}, socket) do
    Presence.update(socket, socket.assigns.client_id, %{
      ingroup: case ingroup do
        true -> true
        false -> false
      end
    })
    send self(), :collective?
    {:noreply, socket}
  end

end
