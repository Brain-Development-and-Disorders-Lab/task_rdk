import matplotlib.pyplot as plt
import pandas as pd

DATA_PATH = []

def rt_calc(path):
    print("Participant", path)

    # Load the participant data
    data = pd.read_csv(path)

    # Filter to trials and confidence trials only
    data = data[data["name"].isin(["calibration-constant", "calibration", "main"])]
    data = data[data["confidenceMistake"].notnull()]

    # Select relevant columns
    data = data[["confidenceSelection", "confidenceTotalTime", "confidenceMistake"]]

    comp_data = []

    # Check each confidence rating level
    for i in range(50, 110, 10):
      conf_rsp = data[data["confidenceSelection"] == float(i)]["confidenceTotalTime"]
      if conf_rsp.empty:
          comp_data.append({"selection": i, "count": 0, "rt": 0})
          continue
      m_rt = conf_rsp.mean()
      print(i, conf_rsp.count(), round((conf_rsp.count() / 64) * 100, 2), round(m_rt, 2))
      comp_data.append({"selection": i, "count": conf_rsp.count(), "rt": round(m_rt, 2)})

    comp = pd.DataFrame(comp_data)
    fig, ax = plt.subplots()
    plt.title(path)

    ax.bar(comp["selection"], comp["count"], width=10, edgecolor="white", linewidth=0.7)
    ax.set(xlabel="Confidence (%)", xlim=(50, 100), xticks=range(50, 110, 10), ylabel="Response Count", ylim=(0, comp["count"].max() + 1))

    rt_ax = ax.twinx()
    rt_ax.plot(comp["selection"], comp["rt"], marker="o", linestyle="none", color="red")
    rt_ax.set(ylabel="Mean RT (ms)", ylim=(0, comp["rt"].max() + 200))

    plt.show()

if __name__ == "__main__":
    for path in DATA_PATH:
      rt_calc(path)
